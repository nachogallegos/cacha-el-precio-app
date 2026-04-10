import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen() {
  const { signIn, signUp } = useContext(AuthContext);
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Faltan datos', 'Ingresa tu email y contraseña.');
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error) {
      Alert.alert('Error al ingresar', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !fullName) return Alert.alert('Faltan datos', 'Completa todos los campos.');
    if (password.length < 6) return Alert.alert('Contraseña muy corta', 'Mínimo 6 caracteres.');
    setLoading(true);
    try {
      await signUp(email, password, fullName);
      Alert.alert('¡Listo!', 'Cuenta creada. Revisa tu email para confirmar y luego inicia sesión.');
      setMode('login');
    } catch (error) {
      Alert.alert('Error al registrarse', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.container} bounces={false} keyboardShouldPersistTaps="handled">
          
          <View style={styles.branding}>
            <View style={styles.logoCircle}>
              <Ionicons name="cart" size={60} color={colors.primary} />
            </View>
            <Text style={styles.title}>Cacha el Precio</Text>
            <Text style={styles.subtitle}>Tu cotizador definitivo de supermercados chilenos.</Text>
          </View>

          <View style={styles.actionsBox}>
            {/* Selector modo */}
            <View style={styles.modeToggle}>
              <TouchableOpacity style={[styles.modeBtn, mode === 'login' && styles.modeBtnActive]} onPress={() => setMode('login')}>
                <Text style={[styles.modeBtnText, mode === 'login' && styles.modeBtnTextActive]}>Iniciar Sesión</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modeBtn, mode === 'register' && styles.modeBtnActive]} onPress={() => setMode('register')}>
                <Text style={[styles.modeBtnText, mode === 'register' && styles.modeBtnTextActive]}>Registrarse</Text>
              </TouchableOpacity>
            </View>

            {mode === 'register' && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nombre completo</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Juan Pérez"
                  placeholderTextColor={colors.textMuted}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="tu@email.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Contraseña</Text>
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
              onPress={mode === 'login' ? handleLogin : handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.card} />
              ) : (
                <Text style={styles.primaryBtnText}>{mode === 'login' ? 'Ingresar' : 'Crear Cuenta'}</Text>
              )}
            </TouchableOpacity>

          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Al continuar, aceptas nuestros términos de servicio y las políticas de privacidad.
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.primary },
  container: { flexGrow: 1, justifyContent: 'space-between' },
  
  branding: { alignItems: 'center', marginTop: '15%', paddingHorizontal: 32 },
  logoCircle: { width: 100, height: 100, backgroundColor: colors.card, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 10, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 8 },
  title: { fontSize: 32, fontWeight: '900', color: colors.card, marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 15, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 22 },

  actionsBox: { backgroundColor: colors.card, marginHorizontal: 20, padding: 24, borderRadius: 24, elevation: 5, shadowColor: '#000', shadowOffset:{width:0, height: 10}, shadowOpacity: 0.1, shadowRadius: 20, marginTop: 32 },
  
  modeToggle: { flexDirection: 'row', backgroundColor: colors.background, borderRadius: 12, padding: 4, marginBottom: 24 },
  modeBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  modeBtnActive: { backgroundColor: colors.primary },
  modeBtnText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  modeBtnTextActive: { color: colors.card },

  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: 6 },
  input: { backgroundColor: colors.background, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: colors.text, borderWidth: 1, borderColor: colors.border },

  primaryBtn: { backgroundColor: colors.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  primaryBtnText: { color: colors.card, fontSize: 16, fontWeight: 'bold' },

  footer: { padding: 24, alignItems: 'center', marginBottom: 20 },
  footerText: { fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 18 }
});
