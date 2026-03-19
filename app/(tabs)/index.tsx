import { ThemedView } from '@/components/ThemedView';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
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

      <View style={styles.contentContainer}>
        <Image
          source={require('@/assets/images/LogoBienvenida.png')}
          style={styles.logo}
        />
        <Text style={styles.welcomeText}>BIENVENID@</Text>
      </View>

      <View style={styles.buttonContainer}>
        <Link href="/login" asChild>
          <TouchableOpacity style={styles.loginButton}>
            <Text style={styles.loginButtonText}>Iniciar sesión</Text>
          </TouchableOpacity>
        </Link>
        <Link href="/register" asChild>
          <TouchableOpacity style={styles.registerButton}>
            <Text style={styles.registerButtonText}>Registrarse</Text>
          </TouchableOpacity>
        </Link>
      </View>
      </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  elipse1: {
    position: 'absolute',
    top: -80,
    left: 1,
    width: 400,
    height: 300,
    zIndex: -1,
  },
  elipse2: {
    position: 'absolute',
    bottom: -50,
    left: -110,
    width: 300,
    height: 300,
    zIndex: -1,
  },
  elipse3: {
    position: 'absolute',
    bottom: 120,
    right: -20,
    width: 110,
    height: 100,
    zIndex: -1,
  },
  elipse4: {
    position: 'absolute',
    bottom: 120,
    right: -100,
    width: 110,
    height: 100,
    zIndex: -1,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  logo: {
    width: 300,
    height: 200,
    resizeMode: 'contain',
  },
  welcomeText: {
    color: '#D4AF37',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: -10,
  },
  buttonContainer: {
    width: '80%',
    alignSelf: 'center',
    marginBottom: 80,
  },
  loginButton: {
    backgroundColor: '#5CAC40',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerButton: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  registerButtonText: {
    color: '#5CAC40',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
