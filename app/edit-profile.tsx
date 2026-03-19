import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import authService, { Ciudad, Role, UpdateUserData } from '../services/auth.service';

interface EditProfileData {
  cedula: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudadId: number | null;
  rolId: number;
}

export default function EditProfileScreen() {
  const [formData, setFormData] = useState<EditProfileData>({
    cedula: '',
    nombre: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudadId: null,
    rolId: 0
  });
  
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedCiudad, setSelectedCiudad] = useState<Ciudad | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Estados de error para validación
  const [cedulaError, setCedulaError] = useState('');
  const [nombreError, setNombreError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [telefonoError, setTelefonoError] = useState('');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      
      // Cargar datos del usuario actual
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setFormData({
          cedula: currentUser.cedula || '',
          nombre: currentUser.nombre || '',
          email: currentUser.email || '',
          telefono: currentUser.telefono || '',
          direccion: currentUser.direccion || '',
          ciudadId: currentUser.ciudad?.id || null,
          rolId: currentUser.rol?.id || 0
        });
      }

      // Cargar ciudades y roles
      const [ciudadesData, rolesData] = await Promise.all([
        authService.getCiudades(),
        authService.getRoles()
      ]);
      
      setCiudades(ciudadesData);
      setRoles(rolesData);
      
      // Seleccionar ciudad y rol actuales
      if (currentUser?.ciudad) {
        const userCiudad = ciudadesData.find(c => c.id === currentUser.ciudad.id);
        setSelectedCiudad(userCiudad || null);
      }
      
      if (currentUser?.rol) {
        const userRole = rolesData.find(r => r.id === currentUser.rol.id);
        setSelectedRole(userRole || null);
      }
      
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      Alert.alert('❌ Error', 'No se pudieron cargar los datos');
    } finally {
      setLoadingData(false);
    }
  };

  // Funciones de validación
  const validateCedula = (value: string) => {
    if (!value) {
      setCedulaError('');
      return;
    }
    if (!/^\d+$/.test(value)) {
      setCedulaError('La cédula solo debe contener números');
    } else {
      setCedulaError('');
    }
  };

  const validateNombre = (value: string) => {
    if (!value) {
      setNombreError('');
      return;
    }
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
      setNombreError('El nombre solo debe contener letras');
    } else {
      setNombreError('');
    }
  };

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError('');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError('Ingrese un email válido');
    } else {
      setEmailError('');
    }
  };

  const validateTelefono = (value: string) => {
    if (!value) {
      setTelefonoError('');
      return;
    }
    if (!/^\d+$/.test(value)) {
      setTelefonoError('El teléfono solo debe contener números');
    } else if (value.length < 7 || value.length > 15) {
      setTelefonoError('El teléfono debe tener entre 7 y 15 dígitos');
    } else {
      setTelefonoError('');
    }
  };

  const validateForm = () => {
    validateCedula(formData.cedula);
    validateNombre(formData.nombre);
    validateEmail(formData.email);
    validateTelefono(formData.telefono);

    return !cedulaError && !nombreError && !emailError && !telefonoError &&
           formData.cedula && formData.nombre && formData.email && formData.telefono;
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) {
      Alert.alert('❌ Error', 'Por favor, corrige los errores en el formulario');
      return;
    }

    try {
      setLoading(true);
      
      const currentUser = await authService.getCurrentUser();
      if (!currentUser?.id) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

      const updateData: UpdateUserData = {
        cedula: formData.cedula.trim(),
        nombre: formData.nombre.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        direccion: formData.direccion.trim(),
        ciudadId: selectedCiudad?.id || null,
        rolId: selectedRole?.id || formData.rolId
      };

      console.log('📤 Actualizando perfil...');
      await authService.updateUser(currentUser.id, updateData);
      
      Alert.alert(
        '✅ Perfil Actualizado',
        'Tu perfil se ha actualizado exitosamente',
        [
          {
            text: 'Continuar',
            onPress: () => router.back()
          }
        ]
      );
      
    } catch (error) {
      console.error('❌ Error actualizando perfil:', error);
      let errorMessage = '❌ Ha ocurrido un error al actualizar el perfil.';
      
      if (error instanceof Error) {
        if (error.message.includes('correo electrónico ya existe')) {
          errorMessage = '❌ Este correo electrónico ya está registrado por otro usuario.';
        } else if (error.message.includes('cédula ya existe')) {
          errorMessage = '❌ Esta cédula ya está registrada por otro usuario.';
        } else {
          errorMessage = `❌ ${error.message}`;
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="person-circle" size={80} color="#D4AF37" />
          <ThemedText style={styles.loadingText}>Cargando datos...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerSpacer} />
        <ThemedText style={styles.headerTitle}>Editar Perfil</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <ThemedText style={styles.subtitle}>
            Actualiza tu información personal
          </ThemedText>

          <View style={styles.form}>
            {/* Campo Cédula */}
            <Text style={styles.inputLabel}>Cédula</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ingrese su cédula"
                value={formData.cedula}
                onChangeText={(value) => {
                  setFormData(prev => ({ ...prev, cedula: value }));
                  validateCedula(value);
                }}
                keyboardType="numeric"
                editable={!loading}
                maxLength={15}
              />
            </View>
            {cedulaError ? <Text style={styles.errorText}>{cedulaError}</Text> : null}

            {/* Campo Nombre */}
            <Text style={styles.inputLabel}>Nombre</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ingrese su nombre completo"
                value={formData.nombre}
                onChangeText={(value) => {
                  setFormData(prev => ({ ...prev, nombre: value }));
                  validateNombre(value);
                }}
                editable={!loading}
                maxLength={100}
              />
            </View>
            {nombreError ? <Text style={styles.errorText}>{nombreError}</Text> : null}

            {/* Campo Email */}
            <Text style={styles.inputLabel}>Correo Electrónico</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="ejemplo@correo.com"
                value={formData.email}
                onChangeText={(value) => {
                  setFormData(prev => ({ ...prev, email: value }));
                  validateEmail(value);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
                maxLength={100}
              />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            {/* Campo Teléfono */}
            <Text style={styles.inputLabel}>Teléfono</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ingrese su teléfono"
                value={formData.telefono}
                onChangeText={(value) => {
                  setFormData(prev => ({ ...prev, telefono: value }));
                  validateTelefono(value);
                }}
                keyboardType="phone-pad"
                editable={!loading}
                maxLength={15}
              />
            </View>
            {telefonoError ? <Text style={styles.errorText}>{telefonoError}</Text> : null}

            {/* Campo Dirección */}
            <Text style={styles.inputLabel}>Dirección</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ingrese su dirección"
                value={formData.direccion}
                onChangeText={(value) => setFormData(prev => ({ ...prev, direccion: value }))}
                editable={!loading}
                maxLength={200}
              />
            </View>

            {/* Selector de Ciudad */}
            <Text style={styles.inputLabel}>Ciudad</Text>
            <View style={[styles.inputContainer, styles.pickerContainer]}>
              <Picker
                selectedValue={selectedCiudad?.id}
                onValueChange={(itemValue) => {
                  const ciudad = ciudades.find(c => c.id === itemValue);
                  setSelectedCiudad(ciudad || null);
                }}
                enabled={!loading}
                style={styles.picker}
              >
                {ciudades.map((ciudad) => (
                  <Picker.Item
                    key={ciudad.id}
                    label={ciudad.nombre}
                    value={ciudad.id}
                  />
                ))}
              </Picker>
            </View>

            {/* Selector de Rol */}
            <Text style={styles.inputLabel}>Rol</Text>
            <View style={[styles.inputContainer, styles.pickerContainer]}>
              <Picker
                selectedValue={selectedRole?.id}
                onValueChange={(itemValue) => {
                  const role = roles.find(r => r.id === itemValue);
                  setSelectedRole(role || null);
                }}
                enabled={!loading}
                style={styles.picker}
              >
                {roles.map((role) => (
                  <Picker.Item
                    key={role.id}
                    label={role.nombre}
                    value={role.id}
                  />
                ))}
              </Picker>
            </View>

            {/* Botón de actualizar */}
            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleUpdateProfile}
              disabled={loading}
            >
              {loading ? (
                <ThemedText style={styles.updateButtonText}>Actualizando...</ThemedText>
              ) : (
                <ThemedText style={styles.updateButtonText}>Actualizar Perfil</ThemedText>
              )}
            </TouchableOpacity>
          </View>
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
    width: 34,
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
  formContainer: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D3D47',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
    paddingHorizontal: 16,
  },
  input: {
    height: 48,
    fontSize: 16,
    color: '#1D3D47',
  },
  pickerContainer: {
    paddingHorizontal: 0,
  },
  picker: {
    height: 48,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginTop: 4,
  },
  updateButton: {
    backgroundColor: '#5CAC40',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 