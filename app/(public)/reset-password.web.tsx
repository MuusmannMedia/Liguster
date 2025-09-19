// app/reset-password.web.tsx
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { supabase } from '../utils/supabase';

export default function ResetPasswordWeb() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useLocalSearchParams(); // fanger ?code=... i PKCE
  const [checking, setChecking] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);

  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(() => p1.length >= 8 && p1 === p2 && !saving, [p1, p2, saving]);

  useEffect(() => {
    let cancelled = false;

    async function ensureSession() {
      try {
        setChecking(true);

        // 1) Har vi allerede en session (implicit hash kan være auto-processeret)?
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          if (!cancelled) setSessionReady(true);
          return;
        }

        // 2) PKCE: Hvis der er ?code= i URL, byt den til en session
        const hasPKCE = typeof params?.code === 'string' && params.code.length > 0;
        if (hasPKCE) {
          try {
            await supabase.auth.exchangeCodeForSession(window.location.href);
          } catch (e) {
            // fortsæt – måske implicit
          }
        } else {
          // 3) Belt & suspenders: ved implicit burde supabase selv detektere hash'en,
          // men vi prøver at trigge et refresh af sessionen.
          // (Ikke strengt nødvendigt, men har hjulpet i visse SPA-opsætninger)
          await new Promise((r) => setTimeout(r, 50));
        }

        const { data: data2 } = await supabase.auth.getSession();
        if (!cancelled) setSessionReady(!!data2.session);
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    ensureSession();
    return () => {
      cancelled = true;
    };
  }, [pathname, params?.code]);

  const onSave = async () => {
    if (!canSave) return;
    try {
      setSaving(true);
      const { error } = await supabase.auth.updateUser({ password: p1.trim() });
      if (error) throw error;
      Alert.alert('Succes', 'Dit kodeord er opdateret.');
      router.replace('/LoginScreen');
    } catch (e: any) {
      Alert.alert('Fejl', e?.message ?? 'Kunne ikke opdatere kodeord.');
    } finally {
      setSaving(false);
    }
  };

  // UI
  if (checking) {
    return (
      <View style={styles.root}>
        <Text style={styles.title}>Nyt kodeord</Text>
        <Text style={styles.info}>Kontrollerer nulstillingslink…</Text>
      </View>
    );
  }

  if (!sessionReady) {
    return (
      <View style={styles.root}>
        <Text style={styles.title}>Nyt kodeord</Text>
        <Text style={styles.info}>
          Vi kunne ikke finde en aktiv nulstillingssession. Åbn venligst
          nulstillingslinket fra din mail igen og kom straks herind.
        </Text>
        <TouchableOpacity style={styles.btn} onPress={() => router.replace('/LoginScreen')}>
          <Text style={styles.btnText}>TIL LOGIN</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <Text style={styles.title}>Vælg nyt kodeord</Text>
      <TextInput
        style={styles.input}
        placeholder="Nyt kodeord"
        placeholderTextColor="#9aa3ad"
        secureTextEntry
        value={p1}
        onChangeText={setP1}
        returnKeyType="next"
      />
      <TextInput
        style={styles.input}
        placeholder="Gentag kodeord"
        placeholderTextColor="#9aa3ad"
        secureTextEntry
        value={p2}
        onChangeText={setP2}
        returnKeyType="go"
        onSubmitEditing={onSave}
      />
      <TouchableOpacity style={[styles.btn, !canSave && { opacity: 0.6 }]} onPress={onSave} disabled={!canSave}>
        <Text style={styles.btnText}>{saving ? 'Gemmer…' : 'Gem kodeord'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0f1623', alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center', marginBottom: 18 },
  info: { color: '#d1d5db', fontSize: 16, textAlign: 'center', maxWidth: 520, marginBottom: 16 },
  input: {
    backgroundColor: '#ffffff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 16, marginBottom: 12, width: 320,
  },
  btn: { backgroundColor: '#ffffff', borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 6, width: 220 },
  btnText: { color: '#0f1623', fontWeight: '800', fontSize: 16, letterSpacing: 0.3 },
});