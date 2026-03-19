import { useRouter } from 'expo-router';
import React from 'react';
import { Button, Text, View } from 'react-native';

const HomeScreen = () => {
  const router = useRouter();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 24 }}>¡Bienvenido a la Home!</Text>
      <Button title="Cerrar sesión" onPress={() => router.push('/login' as any)} />
    </View>
  );
};

export default HomeScreen; 