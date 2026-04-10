import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';
import { ActivityContext } from '../context/ActivityContext';

const zonesList = ['Región Metropolitana', 'Región de Valparaíso', 'Región del Biobío', 'Región de Coquimbo'];

export default function ProfileScreen() {
  const { user, logout, updateZone } = useContext(AuthContext);
  const { resetSavings } = useContext(ActivityContext);

  if (!user) return null;

  const handleZoneChange = () => {
    Alert.alert(
      "Cambiar Región",
      "Selecciona tu zona para adaptar los precios (Simulación):",
      zonesList.map(z => ({
        text: z,
        onPress: () => updateZone(z)
      })).concat([{ text: 'Cancelar', style: 'cancel' }])
    );
  };

  const handleResetHistory = () => {
    Alert.alert("Atención", "¿Estás seguro que deseas eliminar todo tu ahorro acumulado y búsquedas recientes localmente?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sí, borrar contenido", style: "destructive", onPress: () => {
          if(resetSavings) resetSavings();
          Alert.alert("Éxito", "Historial borrado.");
      }}
    ]);
  };

  const handleMockAction = (title) => {
    Alert.alert(title, "Esta función estará disponible en la próxima actualización.");
  };

  const currentIcon = user.provider === 'Google' ? 'logo-google' 
                    : user.provider === 'Apple' ? 'logo-apple' 
                    : 'call';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        <View style={styles.headerBox}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email || user.provider}</Text>
          
          <View style={styles.providerBadge}>
            <Ionicons name={currentIcon} size={14} color={colors.text} style={{marginRight: 4}} />
            <Text style={styles.providerText}>Conectado vía {user.provider}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>AJUSTES DE PERFIL</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => handleMockAction("Agregar Foto")}>
            <View style={styles.rowLeft}>
              <Ionicons name="camera" size={20} color={colors.textMuted} style={styles.rowIcon}/>
              <Text style={styles.rowText}>Cambiar Foto</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.border} />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row} onPress={() => handleMockAction("Editar Nombre")}>
            <View style={styles.rowLeft}>
              <Ionicons name="create" size={20} color={colors.textMuted} style={styles.rowIcon}/>
              <Text style={styles.rowText}>Editar Nombre</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.border} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>MI CUENTA</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={handleZoneChange}>
            <View style={styles.rowLeft}>
              <Ionicons name="location" size={20} color={colors.textMuted} style={styles.rowIcon}/>
              <Text style={styles.rowText}>Zona de Precios</Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowValue} numberOfLines={1} ellipsizeMode="tail">{user.zone}</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.border} />
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="person-add" size={20} color={colors.textMuted} style={styles.rowIcon}/>
              <Text style={styles.rowText}>Conectar cuenta secundaria</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.border} />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>PRIVACIDAD Y DATOS</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={handleResetHistory}>
            <View style={styles.rowLeft}>
              <Ionicons name="trash" size={20} color={colors.danger} style={styles.rowIcon}/>
              <Text style={[styles.rowText, { color: colors.danger, fontWeight: 'bold' }]}>Limpiar Ahorros y Búsquedas</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Cerrar Sesión Segura</Text>
        </TouchableOpacity>

        <Text style={styles.versioning}>SuperAhorro v1.0.0 (Expo)</Text>
        <Text style={styles.versioningSub}>ID: {user.id}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { padding: 16 },
  
  headerBox: { alignItems: 'center', backgroundColor: colors.card, padding: 24, borderRadius: 20, marginBottom: 24, elevation: 2, shadowColor: '#000', shadowOffset:{width:0, height:2}, shadowOpacity: 0.05, shadowRadius: 6, borderWidth: 1, borderColor: colors.border },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: colors.card },
  userName: { fontSize: 22, fontWeight: 'bold', color: colors.text },
  userEmail: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  providerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 12, borderWidth: 1, borderColor: colors.border },
  providerText: { fontSize: 12, fontWeight: '500', color: colors.text },

  sectionLabel: { fontSize: 13, fontWeight: 'bold', color: colors.textMuted, marginLeft: 12, marginBottom: 8, marginTop: 8 },
  card: { backgroundColor: colors.card, borderRadius: 16, marginBottom: 20, paddingHorizontal: 16, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rowIcon: { marginRight: 12, width: 24, textAlign: 'center' },
  rowText: { fontSize: 15, color: colors.text },
  rowRight: { flexDirection: 'row', alignItems: 'center', maxWidth: '50%' },
  rowValue: { fontSize: 13, color: colors.textMuted, marginRight: 8, flexShrink: 1 },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 36 },

  logoutBtn: { backgroundColor: colors.danger + '10', paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.danger + '40', marginTop: 12 },
  logoutText: { color: colors.danger, fontSize: 16, fontWeight: 'bold' },

  versioning: { textAlign: 'center', color: colors.textMuted, fontSize: 12, marginTop: 40 },
  versioningSub: { textAlign: 'center', color: 'rgba(0,0,0,0.2)', fontSize: 10, marginTop: 4 }
});
