import { ContribucionCard } from '@/components/ContribucionCard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import authService from '../services/auth.service';
import { Contribucion, contribucionService } from '../services/contribucion.service';

interface UserProfile {
  cedula: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad?: string;
  rol?: string;
}

export default function ProfileScreen() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [contribuciones, setContribuciones] = useState<Contribucion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingContribuciones, setLoadingContribuciones] = useState(false);

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      setLoading(true);
      
      // Verificar si el usuario está autenticado
      const isAuth = await authService.isAuthenticated();
      if (!isAuth) {
        console.log('❌ Usuario no autenticado, redirigiendo al login');
        Alert.alert(
          'Sesión Expirada',
          'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
          [
            {
              text: 'Ir al Login',
              onPress: () => router.replace('/login')
            }
          ]
        );
        return;
      }

      // Si está autenticado, cargar datos
      await loadUserProfile();
      await loadContribuciones();
    } catch (error) {
      console.error('❌ Error verificando autenticación:', error);
      Alert.alert(
        'Error de Autenticación',
        'No se pudo verificar tu sesión. Por favor inicia sesión nuevamente.',
        [
          {
            text: 'Ir al Login',
            onPress: () => router.replace('/login')
          }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setUserProfile({
          cedula: user.cedula || 'No especificada',
          nombre: user.nombre || 'No especificado',
          email: user.email || 'No especificado',
          telefono: user.telefono || 'No especificado',
          direccion: user.direccion || 'No especificada',
          ciudad: user.ciudad?.nombre || 'No especificada',
          rol: user.rol?.nombre || 'No especificado'
        });
      } else {
        throw new Error('No se encontraron datos del usuario');
      }
    } catch (error) {
      console.error('❌ Error cargando perfil:', error);
      Alert.alert(
        'Error',
        'No se pudo cargar la información del perfil. Por favor inicia sesión nuevamente.',
        [
          {
            text: 'Ir al Login',
            onPress: () => router.replace('/login')
          }
        ]
      );
    }
  };

  const loadContribuciones = async () => {
    try {
      setLoadingContribuciones(true);
      const contribucionesData = await contribucionService.getContribucionesByUsuario();
      setContribuciones(contribucionesData);
    } catch (error) {
      console.error('❌ Error cargando contribuciones:', error);
      // No mostrar alerta para no interrumpir la experiencia del usuario
      // Solo mostrar mensaje en consola
    } finally {
      setLoadingContribuciones(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.replace('/login');
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
      Alert.alert(
        '⚠️ Advertencia', 
        'Se cerró la sesión localmente. Serás redirigido al login.',
        [
          {
            text: 'Entendido',
            onPress: () => router.replace('/login')
          }
        ]
      );
    }
  };

  const handleClearDataAndRelogin = async () => {
    Alert.alert(
      'Limpiar Datos',
      '¿Estás seguro de que quieres limpiar todos los datos de autenticación? Esto te forzará a iniciar sesión nuevamente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar y Re-login',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.clearTokens();
              Alert.alert(
                'Datos Limpiados',
                'Se han limpiado todos los datos. Por favor inicia sesión nuevamente.',
                [
                  {
                    text: 'Ir al Login',
                    onPress: () => router.replace('/login')
                  }
                ]
              );
            } catch (error) {
              console.error('Error limpiando datos:', error);
              Alert.alert('Error', 'No se pudieron limpiar los datos.');
            }
          }
        }
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/edit-profile');
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="person-circle" size={80} color="#D4AF37" />
          <ThemedText style={styles.loadingText}>Verificando sesión...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!userProfile) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={80} color="#FF6B6B" />
          <ThemedText style={styles.errorText}>No se pudo cargar el perfil</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={checkAuthAndLoadData}>
            <ThemedText style={styles.retryButtonText}>Reintentar</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  const profileFields = [
    { icon: 'id-card', label: 'Cédula', value: userProfile.cedula },
    { icon: 'person', label: 'Nombre', value: userProfile.nombre },
    { icon: 'mail', label: 'Correo Electrónico', value: userProfile.email },
    { icon: 'call', label: 'Teléfono', value: userProfile.telefono },
    { icon: 'location', label: 'Dirección', value: userProfile.direccion },
    { icon: 'business', label: 'Ciudad', value: userProfile.ciudad },
    { icon: 'shield-checkmark', label: 'Rol', value: userProfile.rol }
  ];

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <ThemedText style={styles.headerTitle}>Mi Perfil</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar y nombre */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person-circle" size={100} color="#D4AF37" />
          </View>
          <ThemedText style={styles.userName}>{userProfile.nombre}</ThemedText>
          <ThemedText style={styles.userRole}>{userProfile.rol}</ThemedText>
        </View>

        {/* Información del perfil */}
        <View style={styles.profileInfo}>
          <ThemedText style={styles.sectionTitle}>Información Personal</ThemedText>
          
          {profileFields.map((field, index) => (
            <View key={index} style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name={field.icon as any} size={24} color="#D4AF37" />
              </View>
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>{field.label}</ThemedText>
                <ThemedText style={styles.infoValue}>{field.value}</ThemedText>
              </View>
            </View>
          ))}
        </View>

        {/* Botones de acción */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
            <Ionicons name="create" size={20} color="#FFFFFF" />
            <ThemedText style={styles.actionButtonText}>Editar Perfil</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="#FFFFFF" />
            <ThemedText style={styles.logoutButtonText}>Cerrar Sesión</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearDataButton} onPress={handleClearDataAndRelogin}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <ThemedText style={styles.clearDataButtonText}>Limpiar Datos</ThemedText>
          </TouchableOpacity>
        </View>

        {/* Sección de Contribuciones */}
        <View style={styles.contribucionesSection}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Mis Donaciones</ThemedText>
            <TouchableOpacity onPress={loadContribuciones} disabled={loadingContribuciones}>
              <Ionicons 
                name="refresh" 
                size={20} 
                color={loadingContribuciones ? "#999" : "#D4AF37"} 
              />
            </TouchableOpacity>
          </View>

          {loadingContribuciones ? (
            <View style={styles.loadingContribuciones}>
              <Ionicons name="refresh" size={24} color="#D4AF37" />
              <ThemedText style={styles.loadingContribucionesText}>
                Cargando donaciones...
              </ThemedText>
            </View>
          ) : contribuciones.length > 0 ? (
            <FlatList
              data={contribuciones}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <ContribucionCard 
                  contribucion={item}
                  onPress={() => {
                    Alert.alert(
                      'Detalle de Donación',
                      `Material: ${item.tipoMaterial}\nEstado: ${item.estado}\nFecha: ${new Date(item.fechaContribucion).toLocaleDateString('es-ES')}`
                    );
                  }}
                />
              )}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContribuciones}>
              <Ionicons name="cube-outline" size={48} color="#CCC" />
              <ThemedText style={styles.emptyContribucionesText}>
                No tienes donaciones registradas
              </ThemedText>
              <ThemedText style={styles.emptyContribucionesSubtext}>
                ¡Haz tu primera donación en la sección "Sé Sostenible"!
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerSpacer: {
    width: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1D3D47',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 18,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    marginTop: 20,
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D3D47',
    marginBottom: 5,
  },
  userRole: {
    fontSize: 16,
    color: '#D4AF37',
    fontWeight: '600',
  },
  profileInfo: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D3D47',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoIcon: {
    width: 40,
    alignItems: 'center',
    marginRight: 15,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1D3D47',
    fontWeight: '500',
  },
  actionButtons: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#5CAC40',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  logoutButton: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  clearDataButton: {
    backgroundColor: '#FF9500',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  clearDataButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  contribucionesSection: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  loadingContribuciones: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingContribucionesText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContribuciones: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContribucionesText: {
    marginTop: 20,
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  emptyContribucionesSubtext: {
    marginTop: 10,
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
}); 