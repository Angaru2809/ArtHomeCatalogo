import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function AboutScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#F8FFF4' }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header decorativo */}
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/LogoArt.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.avatarContainer}>
            <Image
              source={require('@/assets/images/iconoSostenible.png')}
              style={styles.avatar}
            />
          </View>
          {/* Círculos decorativos */}
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />
          <View style={styles.circle4} />
        </View>

        {/* Sección Quiénes Somos */}
        <View style={styles.aboutContainer}>
          <Text style={styles.aboutTitle}>¿Quiénes Somos?</Text>
          <Text style={styles.aboutText}>
            En <Text style={styles.brand}>ArtHome</Text> creemos en el poder del reciclaje como herramienta de cambio. Transformamos llantas y materiales desechados en muebles sostenibles que inspiran. Nuestro equipo está comprometido con el medio ambiente, la economía circular y el diseño con propósito. ♻️🌱
          </Text>
        </View>

        {/* Tarjeta de proceso */}
        <View style={styles.card}>
          {/* Paso 1 */}
          <View style={styles.step}>
            <Image
              source={require('@/assets/images/ruedasIcon.png')}
              style={styles.icon}
            />
            <Text style={styles.stepText}>
              ♻️ Se recolectan llantas usadas y otros materiales reciclables de manera segura, evitando su acumulación en botaderos y fomentando una gestión ambiental responsable.
            </Text>
          </View>
          <Image
            source={require('@/assets/images/flechaAbajo.png')}
            style={styles.arrow}
          />
          {/* Paso 2 */}
          <View style={styles.step}>
            <Image
              source={require('@/assets/images/herramientasIcon.png')}
              style={styles.icon}
            />
            <Text style={styles.stepText}>
              🔧 Inicia el proceso de transformación: se realiza la limpieza, corte y adecuación de los materiales mediante herramientas especializadas y técnicas artesanales.
            </Text>
          </View>
          <Image
            source={require('@/assets/images/flechaAbajo.png')}
            style={styles.arrow}
          />
          {/* Paso 3 */}
          <View style={styles.step}>
            <Image
              source={require('@/assets/images/muebleIcon.png')}
              style={styles.icon}
            />
            <Text style={styles.stepText}>
              🛋️ Finalmente, se elaboran muebles únicos, resistentes y decorativos que combinan diseño, funcionalidad y sostenibilidad, promoviendo una economía circular.
            </Text>
          </View>
        </View>

        {/* Cards informativas al final */}
        <View style={styles.infoCardsContainer}>
          {/* Historia */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Nuestra Historia</Text>
            <Text style={styles.infoCardText}>
              ArtHome nació con la visión de transformar espacios a través del arte y el diseño. Nos especializamos en ofrecer una cuidadosa selección de muebles y decoración que combinan funcionalidad con estética.
            </Text>
          </View>
          {/* Misión */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Nuestra Misión</Text>
            <Text style={styles.infoCardText}>
              Buscamos inspirar a nuestros clientes a crear espacios únicos y acogedores, ofreciendo productos de alta calidad que reflejen su personalidad y estilo de vida.
            </Text>
          </View>
          {/* Valores */}
          <View style={styles.infoCard}>
            <Text style={styles.infoCardTitle}>Nuestros Valores</Text>
            <Text style={styles.infoCardText}>
              • Calidad y durabilidad{'\n'}
              • Diseño innovador{'\n'}
              • Atención personalizada{'\n'}
              • Compromiso con la satisfacción del cliente
            </Text>
          </View>
        </View>

        {/* Curva decorativa inferior */}
        <View style={styles.curvaInferior} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#F8FFF4',
    paddingBottom: 80,
  },
  header: {
    backgroundColor: '#8EF0A0',
    height: 160,
    width: '120%',
    borderBottomLeftRadius: 180,
    borderBottomRightRadius: 180,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderWidth: 1,
    borderColor: '#5CAC40',
    marginBottom: 60,
    position: 'relative',
    overflow: 'visible',
  },
  logo: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    marginTop: 18,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: -35,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  avatar: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  },
  aboutContainer: {
    marginTop: 40,
    paddingHorizontal: 25,
    alignItems: 'center',
    width: '100%',
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37', // dorado
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 1,
  },
  aboutText: {
    fontSize: 16,
    color: '#5CAC40',
    textAlign: 'center',
    fontWeight: '500',
  },
  brand: {
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#fff',
    padding: 22,
    borderRadius: 24,
    width: '92%',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.13,
    shadowRadius: 6,
    marginTop: 30,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  icon: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
    marginRight: 12,
    marginTop: 5,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    textAlign: 'left',
    fontWeight: '400',
  },
  arrow: {
    width: 22,
    height: 30,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginVertical: 2,
  },
  curvaInferior: {
    position: 'absolute',
    bottom: -120,
    width: 400,
    height: width * 0.5,
    backgroundColor: '#8EF0A0',
    borderTopLeftRadius: 200,
    borderTopRightRadius: 200,
    borderWidth: 1,
    borderColor: '#5CAC40',
  },
  // Círculos decorativos dorados y verdes
  circle1: {
    position: 'absolute',
    top: 110,
    left: 30,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E3C16F',
    opacity: 0.7,
  },
  circle2: {
    position: 'absolute',
    top: 40,
    right: 40,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E3C16F',
    opacity: 0.7,
  },
  circle3: {
    position: 'absolute',
    top: 120,
    left: 80,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#8EF0A0',
    borderColor: '#5CAC40',
    borderWidth: 1,
    opacity: 0.7,
  },
  circle4: {
    position: 'absolute',
    top: 100,
    right: 90,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8EF0A0',
    borderColor: '#5CAC40',
    borderWidth: 1,
    opacity: 0.7,
  },
  infoCardsContainer: {
    width: '92%',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    borderLeftWidth: 5,
    borderLeftColor: '#D4AF37', // dorado
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5CAC40',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  infoCardText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
}); 