import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import authService from '../services/auth.service';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Estados de error para cada campo
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Funciones de validación en tiempo real
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

  const validatePassword = (value: string) => {
    if (!value) {
      setPasswordError('');
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
      setPasswordError(errors.join(', '));
    } else {
      setPasswordError('');
    }
  };

  // Handlers para los campos con validación en tiempo real
  const handleEmailChange = (value: string) => {
    setEmail(value);
    validateEmail(value);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    validatePassword(value);
  };

  const validateForm = () => {
    // console.log('🔍 Iniciando validación del formulario de login');
    
    // Validar email
    if (!email.trim()) {
      setEmailError('El email es requerido');
      // console.log('❌ Errores de validación encontrados');
      return false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Ingresa un email válido');
      return false;
    } else {
      setEmailError('');
    }

    // Validar contraseña
    if (!password) {
      setPasswordError('La contraseña es requerida');
      return false;
    } else if (password.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres');
      return false;
    } else if (password.length > 25) {
      setPasswordError('La contraseña debe tener máximo 25 caracteres');
      return false;
    } else if (!/[A-Z]/.test(password)) {
      setPasswordError('La contraseña debe contener al menos una letra mayúscula');
      return false;
    } else if (!/[a-z]/.test(password)) {
      setPasswordError('La contraseña debe contener al menos una letra minúscula');
      return false;
    } else if (!/\d/.test(password)) {
      setPasswordError('La contraseña debe contener al menos un número');
      return false;
    } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      setPasswordError('La contraseña debe contener al menos un carácter especial');
      return false;
    } else {
      setPasswordError('');
    }

    // console.log('✅ Validación exitosa');
    return true;
  };

  const handleLogin = async () => {
    console.log('🔍 handleLogin iniciado');
    // console.log('📝 Datos del formulario:', {
    //   email: email,
    //   password: password ? '***' : 'vacía'
    // });

    if (!validateForm()) {
      console.log('❌ Validación falló');
      return;
    }

    console.log('✅ Validación pasó, iniciando login...');

    try {
      setLoading(true);
      console.log('🔄 Estado de carga activado');
      
      const loginData = {
        email: email.trim().toLowerCase(),
        contrasena: password
      };

      console.log('📤 Enviando datos al backend:', { 
        email: loginData.email,
        contrasena: '***'
      });
      
      // Login real contra el backend: guarda tokens y usuario localmente
      await authService.login(loginData);

      // Limpiar el formulario
      setEmail('');
      setPassword('');
      setEmailError('');
      setPasswordError('');

      console.log('✅ Login OK, redirigiendo a donate...');
      router.push('/(tabs)/donate');
      
      // Mostrar alerta de éxito
      Alert.alert(
        '¡Inicio de Sesión Exitoso! 🎉',
        'Bienvenido de vuelta. Serás redirigido a la página de donaciones.',
        [
          {
            text: 'Continuar',
            onPress: () => {
              console.log('🔄 Navegando a donate...');
              router.push('/(tabs)/donate');
            },
          },
        ]
      );
    } catch (error) {
      console.log('❌ Error en login:', error);
      let errorMessage = 'Error al iniciar sesión';
      
      if (error instanceof Error) {
        // Manejar errores específicos del backend
        if (error.message.includes('credenciales')) {
          errorMessage = 'Email o contraseña incorrectos. Verifica tus credenciales.';
        } else if (error.message.includes('usuario no encontrado')) {
          errorMessage = 'No existe una cuenta con este email.';
        } else if (error.message.includes('network')) {
          errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
        } else {
          errorMessage = error.message;
        }
      }
      
      Alert.alert(
        'Error en el Login ❌',
        errorMessage,
        [{ text: 'Entendido' }]
      );
    } finally {
      console.log('🏁 Finalizando login, desactivando carga');
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Fondo con elipses */}
      <Image
        source={require('@/assets/images/Ellipse10.png')}
        style={styles.elipse1}
        contentFit="contain"
      />
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

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formContainer}>
          {/* Logo Art */}
          <Image
            source={require('@/assets/images/LogoArt.png')}
            style={styles.logo}
            contentFit="contain"
          />

          {/* Logo Bienvenida */}
          <Image
            source={require('@/assets/images/LogoBienvenida.png')}
            style={styles.logoBienvenida}
            contentFit="contain"
          />

          <Text style={styles.title}>INICIO DE SESIÓN</Text>

          <View style={styles.form}>
            {/* Campo Email */}
            <Text style={styles.inputLabel}>Correo Electrónico</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Correo electrónico"
                value={email}
                onChangeText={handleEmailChange}
                editable={!loading}
                keyboardType="email-address"
                autoCapitalize="none"
                maxLength={100}
              />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            {/* Campo Contraseña */}
            <Text style={styles.inputLabel}>Contraseña</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry
                editable={!loading}
                maxLength={50}
              />
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

            {/* Checkbox Recordar contraseña */}
            <View style={styles.checkboxContainer}>
              <TouchableOpacity
                style={[styles.checkbox, rememberMe && styles.checkboxChecked]}
                onPress={() => setRememberMe(!rememberMe)}
              >
                {rememberMe && <Ionicons name="checkmark" size={16} color="#fff" />}
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>Guardar contraseña</Text>
            </View>

            {/* Botón de Login */}
            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Explorar🌿</Text>
              )}
            </TouchableOpacity>

            {/* Enlace para registro */}
            <TouchableOpacity
              onPress={() => router.push('/register')}
              style={styles.registerLink}
            >
              <Text style={styles.registerText}>¿Aún no tienes cuenta? Regístrate</Text>
            </TouchableOpacity>

            {/* Botones de redes sociales */}
            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-facebook" size={24} color="#1877F2" />
                <Text style={styles.socialButtonText}>Inicia con Facebook</Text>
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
  logo: {
    width: 180,
    height: 180,
    marginBottom: 20,
    marginTop: -70,
  },
  logoBienvenida: {
    width: 110,
    height: 110,
    marginBottom: 10,
    marginTop: -30,
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: '#A6E9A6',
    borderRadius: 55,
    backgroundColor: '#fff',
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
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#5CAC40',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 6,
  },
  inputLabel: {
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: '#F8FFF6',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#B7EFC5',
    marginBottom: 16,
    shadowColor: '#5CAC40',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'transparent',
    borderRadius: 10,
    fontFamily: 'SpaceMono',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 16,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#5CAC40',
    borderRadius: 6,
    marginRight: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#5CAC40',
    borderColor: '#247524',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'SpaceMono',
  },
  loginButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 50,
    marginTop: 15,
    marginBottom: 10,
    borderWidth: 0,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontFamily: 'SpaceMono',
    fontSize: 20,
    letterSpacing: 1,
    textShadowColor: '#B2952B',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  registerLink: {
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 5,
  },
  registerText: {
    color: '#5CAC40',
    fontFamily: 'SpaceMono',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
    backgroundColor: '#E6F9ED',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    overflow: 'hidden',
    textAlign: 'center',
  },
  socialButtonsContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  socialButton: {
    backgroundColor: '#F8FFF6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B7EFC5',
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginVertical: 5,
    width: '80%',
    alignSelf: 'center',
    shadowColor: '#5CAC40',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'SpaceMono',
    marginLeft: 10,
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
  backButton: {
    display: 'none', // Ocultando el botón de retorno
  },
}); 