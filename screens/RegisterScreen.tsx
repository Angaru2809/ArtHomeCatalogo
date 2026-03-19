import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as Yup from 'yup';
import { authService } from '../services';

const ciudades = ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena'];
const roles = ['Administrador', 'Usuario'];

const validationSchema = Yup.object().shape({
  cedula: Yup.string().required('La cédula es obligatoria'),
  nombre: Yup.string().required('El nombre es obligatorio'),
  email: Yup.string().email('Correo inválido').required('El correo es obligatorio'),
  telefono: Yup.string().required('El teléfono es obligatorio'),
  direccion: Yup.string().required('La dirección es obligatoria'),
  ciudad: Yup.string().required('La ciudad es obligatoria'),
  rol: Yup.string().required('El rol es obligatorio'),
  password: Yup.string().min(6, 'Mínimo 6 caracteres').required('La contraseña es obligatoria'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), ''], 'Las contraseñas no coinciden')
    .required('Confirma tu contraseña'),
});

const RegisterScreen = () => {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    try {
      setIsLoading(true);
      setError('');

      // Preparar los datos para enviar al backend, excluyendo confirmPassword
      const registerData = {
        cedula: values.cedula,
        nombre: values.nombre,
        email: values.email,
        telefono: values.telefono,
        direccion: values.direccion,
        ciudadId: 1, // Ajusta esto según tu lógica de ciudades
        contrasena: values.password, // Usamos password en lugar de confirmPassword
        rolId: 1, // Ajusta esto según tu lógica de roles
      };

      await authService.register(registerData);
      router.push('/login' as any);
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 16, textAlign: 'center' }}>Registro de Usuario</Text>
      <Formik
        initialValues={{
          cedula: '',
          nombre: '',
          email: '',
          telefono: '',
          direccion: '',
          ciudad: '',
          rol: '',
          password: '',
          confirmPassword: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
          <View>
            <TextInput
              placeholder="Cédula"
              style={styles.input}
              onChangeText={handleChange('cedula')}
              onBlur={handleBlur('cedula')}
              value={values.cedula}
              keyboardType="numeric"
            />
            {touched.cedula && errors.cedula && <Text style={styles.error}>{errors.cedula}</Text>}

            <TextInput
              placeholder="Nombre completo"
              style={styles.input}
              onChangeText={handleChange('nombre')}
              onBlur={handleBlur('nombre')}
              value={values.nombre}
            />
            {touched.nombre && errors.nombre && <Text style={styles.error}>{errors.nombre}</Text>}

            <TextInput
              placeholder="Correo electrónico"
              style={styles.input}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              value={values.email}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {touched.email && errors.email && <Text style={styles.error}>{errors.email}</Text>}

            <TextInput
              placeholder="Teléfono"
              style={styles.input}
              onChangeText={handleChange('telefono')}
              onBlur={handleBlur('telefono')}
              value={values.telefono}
              keyboardType="phone-pad"
            />
            {touched.telefono && errors.telefono && <Text style={styles.error}>{errors.telefono}</Text>}

            <TextInput
              placeholder="Dirección"
              style={styles.input}
              onChangeText={handleChange('direccion')}
              onBlur={handleBlur('direccion')}
              value={values.direccion}
            />
            {touched.direccion && errors.direccion && <Text style={styles.error}>{errors.direccion}</Text>}

            <Text style={{ marginTop: 8 }}>Ciudad</Text>
            <Picker
              selectedValue={values.ciudad}
              style={styles.input}
              onValueChange={itemValue => setFieldValue('ciudad', itemValue)}
            >
              <Picker.Item label="Selecciona una ciudad" value="" />
              {ciudades.map(ciudad => (
                <Picker.Item key={ciudad} label={ciudad} value={ciudad} />
              ))}
            </Picker>
            {touched.ciudad && errors.ciudad && <Text style={styles.error}>{errors.ciudad}</Text>}

            <Text style={{ marginTop: 8 }}>Rol</Text>
            <Picker
              selectedValue={values.rol}
              style={styles.input}
              onValueChange={itemValue => setFieldValue('rol', itemValue)}
            >
              <Picker.Item label="Selecciona un rol" value="" />
              {roles.map(rol => (
                <Picker.Item key={rol} label={rol} value={rol} />
              ))}
            </Picker>
            {touched.rol && errors.rol && <Text style={styles.error}>{errors.rol}</Text>}

            <TextInput
              placeholder="Contraseña"
              style={styles.input}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
              secureTextEntry
            />
            {touched.password && errors.password && <Text style={styles.error}>{errors.password}</Text>}

            <TextInput
              placeholder="Confirmar contraseña"
              style={styles.input}
              onChangeText={handleChange('confirmPassword')}
              onBlur={handleBlur('confirmPassword')}
              value={values.confirmPassword}
              secureTextEntry
            />
            {touched.confirmPassword && errors.confirmPassword && (
              <Text style={styles.error}>{errors.confirmPassword}</Text>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {isLoading ? (
              <ActivityIndicator size="large" color="#0000ff" style={{ marginVertical: 16 }} />
            ) : (
              <Button title="Registrarse" onPress={handleSubmit as any} />
            )}
          </View>
        )}
      </Formik>
      <TouchableOpacity onPress={() => router.push('/login' as any)} style={{ marginTop: 16 }}>
        <Text style={{ color: 'blue', textAlign: 'center' }}>¿Ya tienes cuenta? Inicia sesión</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
    width: '100%',
    backgroundColor: '#fff',
  },
  error: {
    color: 'red',
    marginBottom: 8,
    fontSize: 12,
  },
});

export default RegisterScreen; 