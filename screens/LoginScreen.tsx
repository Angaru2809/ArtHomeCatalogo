import { useRouter } from 'expo-router';
import React from 'react';
import { Button, Text, View } from 'react-native';

const LoginScreen = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 24 }}>Pantalla de Login</Text>
      {/* Aquí irían los campos de login reales */}
      <Button title="Iniciar sesión" onPress={() => router.push('/home' as any)} />
      <View style={{ height: 16 }} />
      <Button title="Registrarse" onPress={() => router.push('/register' as any)} />
      <View style={{ height: 16 }} />
      <Button title="¿Olvidaste tu contraseña?" onPress={() => router.push('/forgot-password' as any)} />
    </View>
  );
};

export default LoginScreen; 