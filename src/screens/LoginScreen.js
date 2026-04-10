import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen() {
  const { login } = useContext(AuthContext);

  const mockLoginGoogle = () => login('Google', { name: 'Ignacio O. (Tú)', email: 'ignacio@gmail.com' });
  const mockLoginApple = () => login('Apple', { name: 'Apple User', email: 'hidden@privaterelay.appleid.com' });
  const mockLoginPhone = () => login('Phone', { name: 'Invitado +569', email: '' });

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
        <ScrollView contentContainerStyle={styles.container} bounces={false}>
          
          <View style={styles.branding}>
            <View style={styles.logoCircle}>
              <Ionicons name="cart" size={60} color={colors.primary} />
            </View>
            <Text style={styles.title}>Cacha el Precio</Text>
            <Text style={styles.subtitle}>Tu cotizador definitivo de supermercados. Únete y empieza a ahorrar automáticamente.</Text>
          </View>

          <View style={styles.actionsBox}>
            <Text style={styles.actionsLabel}>Ingresar o Registrarse</Text>

            <TouchableOpacity style={styles.socialBtn} onPress={mockLoginGoogle}>
              <Ionicons name="logo-google" size={24} color={colors.text} style={styles.socialIcon} />
              <Text style={styles.socialBtnText}>Continuar con Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialBtn} onPress={mockLoginApple}>
              <Ionicons name="logo-apple" size={24} color={colors.text} style={styles.socialIcon} />
              <Text style={styles.socialBtnText}>Continuar con Apple</Text>
            </TouchableOpacity>

            <View style={styles.dividerBox}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o ingresa con</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.phoneBtn} onPress={mockLoginPhone}>
              <Ionicons name="call" size={20} color={colors.card} style={styles.socialIcon} />
              <Text style={styles.phoneBtnText}>Número de Teléfono</Text>
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
  
  branding: { alignItems: 'center', marginTop: '20%', paddingHorizontal: 32 },
  logoCircle: { width: 120, height: 120, backgroundColor: colors.card, borderRadius: 60, justifyContent: 'center', alignItems: 'center', marginBottom: 24, elevation: 10, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 8 },
  title: { fontSize: 36, fontWeight: '900', color: colors.card, marginBottom: 12, textAlign: 'center' },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 22 },

  actionsBox: { backgroundColor: colors.card, marginHorizontal: 20, padding: 24, borderRadius: 24, elevation: 5, shadowColor: '#000', shadowOffset:{width:0, height: 10}, shadowOpacity: 0.1, shadowRadius: 20, marginTop: 40 },
  actionsLabel: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 20, textAlign: 'center' },
  
  socialBtn: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border, marginBottom: 16 },
  socialIcon: { marginRight: 16 },
  socialBtnText: { fontSize: 16, fontWeight: '600', color: colors.text },
  
  dividerBox: { flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginBottom: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: 16, color: colors.textMuted, fontSize: 14 },

  phoneBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.text, padding: 16, borderRadius: 12, justifyContent: 'center' },
  phoneBtnText: { fontSize: 16, fontWeight: 'bold', color: colors.card },

  footer: { padding: 24, alignItems: 'center', marginBottom: 20 },
  footerText: { fontSize: 12, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 18 }
});
