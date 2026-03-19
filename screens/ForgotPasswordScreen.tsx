import { useRouter } from 'expo-router';
import React from 'react';
import { Button, Text, TextInput, View } from 'react-native';

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const [email, setEmail] = React.useState('');

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 24 }}>Recuperar contraseña</Text>
      <TextInput
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, borderColor: '#ccc', width: '100%', padding: 8, marginBottom: 16, borderRadius: 4 }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button title="Enviar" onPress={() => {}} />
      <View style={{ height: 16 }} />
      <Button title="Volver al login" onPress={() => router.navigate('/login' as any)} />
    </View>
  );
};

export default ForgotPasswordScreen; 