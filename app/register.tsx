import { ThemedView } from '@/components/ThemedView';
import { Picker } from '@react-native-picker/picker';
import * as Font from 'expo-font';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Easing, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import authService, { Ciudad, Role } from '../services/auth.service';

type KeyboardType = 'default' | 'number-pad' | 'decimal-pad' | 'numeric' | 'email-address' | 'phone-pad';

export default function RegisterScreen({ navigation }: { navigation: any }) {
  const [fuenteCargada, setFuenteCargada] = useState(false);
  const floatAnim = useRef(new Animated.Value(0)).current;

  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [selectedCiudad, setSelectedCiudad] = useState<Ciudad | null>(null);
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Estados de error para cada campo
  const [cedulaError, setCedulaError] = useState('');
  const [nombreError, setNombreError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [telefonoError, setTelefonoError] = useState('');
  const [contrasenaError, setContrasenaError] = useState('');
  const [confirmarContrasenaError, setConfirmarContrasenaError] = useState('');

  useEffect(() => {
    loadInitialData();
    cargarFuente();
    iniciarAnimacion();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingData(true);
      // console.log('🔄 Cargando datos iniciales...');
      
      const [rolesData, ciudadesData] = await Promise.all([
        authService.getRoles(),
        authService.getCiudades()
      ]);
      
      // console.log('📋 Roles cargados:', rolesData);
      // console.log('🏙️ Ciudades cargadas:', ciudadesData);
      
      setRoles(rolesData);
      setCiudades(ciudadesData);
      
      if (rolesData.length > 0) {
        setSelectedRole(rolesData[0]);
        // console.log('✅ Rol seleccionado automáticamente:', rolesData[0]);
      } else {
        // console.log('⚠️ No hay roles disponibles');
      }
      
      if (ciudadesData.length > 0) {
        setSelectedCiudad(ciudadesData[0]);
        // console.log('✅ Ciudad seleccionada automáticamente:', ciudadesData[0]);
      } else {
        // console.log('⚠️ No hay ciudades disponibles');
      }
    } catch (error) {
      console.error('❌ Error cargando datos iniciales:', error);
      Alert.alert(
        'Error',
        'No se pudieron cargar los datos iniciales. Por favor, intenta de nuevo.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoadingData(false);
    }
  };

  const cargarFuente = async () => {
    try {
      await Font.loadAsync({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
      });
      setFuenteCargada(true);
    } catch (error) {
      console.error('Error al cargar las fuentes', error);
    }
  };

  const iniciarAnimacion = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 10,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.quad),
        }),
      ])
    ).start();
  };

  // Funciones de validación en tiempo real
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
      setEmailError('Ingrese un email válido con formato ejemplo@dominio.com');
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

  const validateContrasena = (value: string) => {
    if (!value) {
      setContrasenaError('');
      return;
    }
    
    const errors = [];
    
    if (value.length < 6) {
      errors.push('Mínimo 6 caracteres');
    }
    if (value.length > 25) {
      errors.push('Máximo 25 caracteres');
    }
    if (!/[A-Z]/.test(value)) {
      errors.push('Al menos una letra mayúscula');
    }
    if (!/[a-z]/.test(value)) {
      errors.push('Al menos una letra minúscula');
    }
    if (!/\d/.test(value)) {
      errors.push('Al menos un número');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
      errors.push('Al menos un carácter especial');
    }
    
    if (errors.length > 0) {
      setContrasenaError(errors.join(', '));
    } else {
      setContrasenaError('');
    }
  };

  const validateConfirmarContrasena = (value: string) => {
    if (!value) {
      setConfirmarContrasenaError('');
      return;
    }
    if (value !== contrasena) {
      setConfirmarContrasenaError('Las contraseñas no coinciden');
    } else {
      setConfirmarContrasenaError('');
    }
  };

  // Handlers para los campos con validación en tiempo real
  const handleCedulaChange = (value: string) => {
    setCedula(value);
    validateCedula(value);
  };

  const handleNombreChange = (value: string) => {
    setNombre(value);
    validateNombre(value);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    validateEmail(value);
  };

  const handleTelefonoChange = (value: string) => {
    setTelefono(value);
    validateTelefono(value);
  };

  const handleContrasenaChange = (value: string) => {
    setContrasena(value);
    validateContrasena(value);
    // Revalidar confirmación cuando cambia la contraseña principal
    if (confirmarContrasena) {
      validateConfirmarContrasena(confirmarContrasena);
    }
  };

  const handleConfirmarContrasenaChange = (value: string) => {
    setConfirmarContrasena(value);
    validateConfirmarContrasena(value);
  };

  const validateForm = () => {
    // console.log('🔍 Iniciando validación del formulario de registro');
    
    let isValid = true;
    
    // Validar cédula
    if (!cedula.trim()) {
      setCedulaError('La cédula es requerida');
      isValid = false;
    } else if (!/^\d+$/.test(cedula.trim())) {
      setCedulaError('La cédula solo debe contener números');
      isValid = false;
    } else {
      setCedulaError('');
    }

    // Validar nombre
    if (!nombre.trim()) {
      setNombreError('El nombre es requerido');
      isValid = false;
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(nombre.trim())) {
      setNombreError('El nombre solo debe contener letras');
      isValid = false;
    } else {
      setNombreError('');
    }

    // Validar email
    if (!email.trim()) {
      setEmailError('El email es requerido');
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Ingresa un email válido');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Validar teléfono
    if (!telefono.trim()) {
      setTelefonoError('El teléfono es requerido');
      isValid = false;
    } else if (!/^\d+$/.test(telefono.trim())) {
      setTelefonoError('El teléfono solo debe contener números');
      isValid = false;
    } else if (telefono.trim().length < 7 || telefono.trim().length > 15) {
      setTelefonoError('El teléfono debe tener entre 7 y 15 dígitos');
      isValid = false;
    } else {
      setTelefonoError('');
    }

    // Validar contraseña
    if (!contrasena) {
      setContrasenaError('La contraseña es requerida');
      isValid = false;
    } else if (contrasena.length < 6) {
      setContrasenaError('La contraseña debe tener al menos 6 caracteres');
      isValid = false;
    } else if (contrasena.length > 25) {
      setContrasenaError('La contraseña debe tener máximo 25 caracteres');
      isValid = false;
    } else if (!/[A-Z]/.test(contrasena)) {
      setContrasenaError('La contraseña debe contener al menos una letra mayúscula');
      isValid = false;
    } else if (!/[a-z]/.test(contrasena)) {
      setContrasenaError('La contraseña debe contener al menos una letra minúscula');
      isValid = false;
    } else if (!/\d/.test(contrasena)) {
      setContrasenaError('La contraseña debe contener al menos un número');
      isValid = false;
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(contrasena)) {
      setContrasenaError('La contraseña debe contener al menos un carácter especial');
      isValid = false;
    } else {
      setContrasenaError('');
    }

    // Validar confirmar contraseña
    if (!confirmarContrasena) {
      setConfirmarContrasenaError('Confirma tu contraseña');
      isValid = false;
    } else if (confirmarContrasena !== contrasena) {
      setConfirmarContrasenaError('Las contraseñas no coinciden');
      isValid = false;
    } else {
      setConfirmarContrasenaError('');
    }

    // console.log('✅ Validación completada, formulario válido:', isValid);
    return isValid;
  };

  const handleRegister = async () => {
    // console.log('🔍 handleRegister iniciado');
    // console.log('📝 Datos del formulario:', {
    //   cedula: cedula,
    //   nombre: nombre,
    //   email: email,
    //   telefono: telefono,
    //   direccion: direccion,
    //   ciudadId: selectedCiudad?.id,
    //   rolId: selectedRole?.id,
    //   contrasena: contrasena ? '***' : 'vacía'
    // });

    if (!validateForm()) {
      // console.log('❌ Validación falló');
      return;
    }

    // console.log('✅ Validación pasó, iniciando registro...');

    try {
      setLoading(true);
      // console.log('🔄 Estado de carga activado');
      
      const registerData = {
        cedula: cedula.trim(),
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        telefono: telefono.trim(),
        direccion: direccion.trim(),
        ciudadId: selectedCiudad?.id || null,
        contrasena: contrasena,
        rolId: selectedRole?.id || 1
      };

      // console.log('📤 Enviando datos al backend:', { 
      //   ...registerData,
      //   contrasena: '***'
      // });
      
      await authService.register(registerData);
      
      // console.log('✅ Registro exitoso');
      
      // Limpiar el formulario
      setCedula('');
      setNombre('');
      setEmail('');
      setTelefono('');
      setDireccion('');
      setContrasena('');
      setConfirmarContrasena('');
      setCedulaError('');
      setNombreError('');
      setEmailError('');
      setTelefonoError('');
      setContrasenaError('');
      setConfirmarContrasenaError('');
      
      // Mostrar alerta de éxito
      Alert.alert(
        '¡Registro Exitoso! 🎉',
        'Tu cuenta ha sido creada correctamente. Ahora puedes iniciar sesión.',
        [
          {
            text: 'Iniciar Sesión',
            onPress: () => {
              // console.log('🔄 Navegando a login...');
              router.push('/login');
            },
          },
        ]
      );
    } catch (error) {
      // console.log('❌ Error en registro:', error);
      let errorMessage = 'Error al registrar usuario';
      
      if (error instanceof Error) {
        // Manejar errores específicos del backend
        if (error.message.includes('ya existe')) {
          errorMessage = 'Ya existe una cuenta con este email.';
        } else if (error.message.includes('ciudad')) {
          errorMessage = 'La ciudad seleccionada no es válida.';
        } else if (error.message.includes('rol')) {
          errorMessage = 'El rol seleccionado no es válido.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert(
        'Error en el Registro ❌',
        errorMessage,
        [{ text: 'Entendido' }]
      );
    } finally {
      // console.log('🏁 Finalizando registro, desactivando carga');
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D4AF37" />
          <Text style={styles.loadingText}>Cargando formulario...</Text>
        </View>
      </ThemedView>
    );
  }

  if (!fuenteCargada) {
    return <Text>Loading fonts...</Text>;
  }

  return (
    <ThemedView style={styles.container}>
      {/* Fondo con elipses */}
      
      <Image
        source={require('@/assets/images/Ellipse16.png')}
        style={styles.elipse2}
        contentFit="contain"
      />
      <Image
        source={require('@/assets/images/Ellipse12.png')}
        style={styles.elipse3}
        contentFit="contain"
      />
      <Image
        source={require('@/assets/images/Ellipse17.png')}
        style={styles.elipse4}
        contentFit="contain"
      />
      <Image
        source={require('@/assets/images/Ellipse18.png')}
        style={styles.elipse5}
        contentFit="contain"
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          <View style={styles.header}>
            <Image source={require('../assets/images/LogoArt.png')} style={styles.logo} />
            <View style={styles.circuloDecorativo1} />
            <View style={styles.circuloDecorativo11} />
            <View style={styles.circuloDecorativo2} />
            <View style={styles.circuloDecorativo22} />
          </View>
          <View style={styles.userCircle}> 
            <Image source={require('../assets/images/LogoBienvenida.png')} style={styles.userIcon} />
          </View>

          <Text style={styles.title}>REGISTRO DE USUARIO</Text>

          <View style={styles.form}>
            {/* Campo Cédula */}
            <Text style={styles.inputLabel}>Cédula</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Número de cédula"
                value={cedula}
                onChangeText={handleCedulaChange}
                editable={!loading}
                keyboardType="numeric"
                maxLength={20}
              />
            </View>
            {cedulaError ? <Text style={styles.errorText}>{cedulaError}</Text> : null}

            {/* Campo Nombre */}
            <Text style={styles.inputLabel}>Nombre Completo</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Tu nombre completo"
                value={nombre}
                onChangeText={handleNombreChange}
                editable={!loading}
                autoCapitalize="words"
                maxLength={100}
              />
            </View>
            {nombreError ? <Text style={styles.errorText}>{nombreError}</Text> : null}

            {/* Campo Email */}
            <Text style={styles.inputLabel}>Correo Electrónico</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="tu@email.com"
                value={email}
                onChangeText={handleEmailChange}
                editable={!loading}
                keyboardType="email-address"
                autoCapitalize="none"
                maxLength={100}
              />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            {/* Campo Teléfono */}
            <Text style={styles.inputLabel}>Teléfono</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Número de teléfono"
                value={telefono}
                onChangeText={handleTelefonoChange}
                editable={!loading}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>
            {telefonoError ? <Text style={styles.errorText}>{telefonoError}</Text> : null}

            {/* Campo Dirección */}
            <Text style={styles.inputLabel}>Dirección</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Tu dirección completa"
                value={direccion}
                onChangeText={setDireccion}
                editable={!loading}
                autoCapitalize="words"
                maxLength={200}
              />
            </View>

            {/* Campo Ciudad */}
            <Text style={styles.inputLabel}>Ciudad</Text>
            <View style={styles.pickerContainer}>
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

            {/* Campo Contraseña */}
            <Text style={styles.inputLabel}>Contraseña</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Crea una contraseña segura"
                value={contrasena}
                onChangeText={handleContrasenaChange}
                secureTextEntry
                editable={!loading}
                maxLength={25}
              />
            </View>
            {contrasenaError ? <Text style={styles.errorText}>{contrasenaError}</Text> : null}

            {/* Campo Confirmar Contraseña */}
            <Text style={styles.inputLabel}>Confirmar Contraseña</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Repite tu contraseña"
                value={confirmarContrasena}
                onChangeText={handleConfirmarContrasenaChange}
                secureTextEntry
                editable={!loading}
                maxLength={25}
              />
            </View>
            {confirmarContrasenaError ? <Text style={styles.errorText}>{confirmarContrasenaError}</Text> : null}

            {/* Botón de Registro */}
            <TouchableOpacity
              style={styles.boton}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.botonTexto}>{loading ? 'Registrando...' : '👉 Crear cuenta'}</Text>
            </TouchableOpacity>

            <View style={styles.fraseDecorativaBox}>
              <Text style={styles.fraseDecorativa}>
                ♻️ <Text style={{fontWeight:'bold'}}>En ArtHome, tu creatividad impulsa el cambio:</Text> transforma llantas recicladas en muebles únicos, y dale nueva vida no solo a los espacios, sino también al planeta. 🌿
              </Text>
            </View>

            <View style={styles.linkBox}>
              <Text style={styles.linkPregunta}>¿Ya tienes una cuenta?</Text>
              <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={styles.linkIniciaSesion}>Inicia sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
  },
  header: {
    backgroundColor: '#8EF0A0',
    height: 180,
    width: '130%',
    borderBottomLeftRadius: 170,
    borderBottomRightRadius: 170,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#5CAC40',
    marginBottom: 5,
    marginTop: -45,
  },
  logo: {
    width: 220,
    height: 220,
    resizeMode: 'contain',
    marginTop: -35,
    marginBottom: -30,
  },
  userCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -45,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#A6E9A6',
    shadowColor: '#5CAC40',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
  },
  userIcon: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#000',
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  inputLabel: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    marginVertical: 6,
    fontFamily: 'SpaceMono',
    fontSize: 16,
    shadowColor: '#5CAC40',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 16,
  },
  picker: {
    height: 48,
  },
  boton: {
    backgroundColor: '#D4AF37',
    borderRadius: 25,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  botonTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fraseDecorativaBox: {
    backgroundColor: '#E6F9ED',
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    marginTop: 5,
    shadowColor: '#5CAC40',
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
    alignSelf: 'stretch',
  },
  fraseDecorativa: {
    color: '#247524',
    fontFamily: 'SpaceMono',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  linkBox: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  linkPregunta: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  linkIniciaSesion: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    color: '#2ECC40',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    marginTop: 2,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#E6F9ED',
    overflow: 'hidden',
    shadowColor: '#5CAC40',
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 1,
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
  // Estilos para las elipses
  elipse1: {
    position: 'absolute',
    top: -150,
    left: -30,
    width: 400,
    height: 400,
    opacity: 0.9,
  },
  elipse2: {
    position: 'absolute',
    top: 190,
    right: 205,
    width: 300,
    height: 300,
    opacity: 0.7,
  },
  elipse3: {
    position: 'absolute',
    bottom: 350,
    left: 290,
    width: 70,
    height: 200,
    opacity: 0.5,
  },
  elipse4: {
    position: 'absolute',
    top: '50%',
    left: -30,
    width: 150,
    height: 150,
    opacity: 0.1,
  },
  elipse5: {
    position: 'absolute',
    bottom: -30,
    right: -30,
    width: 150,
    height: 150,
    opacity: 0.1,
  },
  circuloDecorativo1: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8EF0A0',
    position: 'absolute',
    top: 80,
    left: 40,
    borderWidth: 1,
    borderColor: '#5CAC40',
    opacity: 0.3,
  },
  circuloDecorativo11: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#8EF0A0',
    position: 'absolute',
    top: 120,
    left: 100,
    borderWidth: 1,
    borderColor: '#5CAC40',
    opacity: 0.2,
  },
  circuloDecorativo2: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8EF0A0',
    position: 'absolute',
    top: 80,
    right: 40,
    borderWidth: 1,
    borderColor: '#5CAC40',
    opacity: 0.3,
  },
  circuloDecorativo22: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#8EF0A0',
    position: 'absolute',
    top: 120,
    left: 320,
    borderWidth: 1,
    borderColor: '#5CAC40',
    opacity: 0.2,
  },
}); 