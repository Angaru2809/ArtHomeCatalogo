import AuthService from '@/services/auth.service';
import { crearResena, obtenerResenas, Resena } from '@/services/resena.service';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function ContactScreen() {
  // Datos de reseñas de clientes
  const reviews = [
    {
      id: 1,
      name: 'María González',
      rating: 5,
      comment: 'Excelente calidad y diseño. Los muebles de llantas recicladas son únicos y muy resistentes. ¡Super recomendados!',
      date: 'Hace 2 semanas'
    },
    {
      id: 2,
      name: 'Carlos Rodríguez',
      rating: 5,
      comment: 'Me encanta la iniciativa ecológica. Los muebles tienen un acabado profesional y son muy cómodos.',
      date: 'Hace 1 mes'
    },
    {
      id: 3,
      name: 'Ana Martínez',
      rating: 4,
      comment: 'Buen precio por la calidad. El proceso de reciclaje se nota en el resultado final. Muy satisfecha.',
      date: 'Hace 3 semanas'
    },
    {
      id: 4,
      name: 'Luis Pérez',
      rating: 5,
      comment: 'Increíble trabajo artesanal. Cada pieza es única y cuenta una historia de sostenibilidad.',
      date: 'Hace 2 meses'
    }
  ];

  const [userComment, setUserComment] = useState('');
  const [userRating, setUserRating] = useState(0);
  const [userReviews, setUserReviews] = useState<Resena[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const total = userReviews.length;
  const cinco = userReviews.filter(r => r.calificacion === 5).length;
  const cuatro = userReviews.filter(r => r.calificacion === 4).length;
  const tres = userReviews.filter(r => r.calificacion === 3).length;
  const dos = userReviews.filter(r => r.calificacion === 2).length;
  const uno = userReviews.filter(r => r.calificacion === 1).length;

  const porcentajeCinco = total ? Math.round((cinco / total) * 100) : 0;
  const porcentajeCuatro = total ? Math.round((cuatro / total) * 100) : 0;
  const porcentajeTres = total ? Math.round((tres / total) * 100) : 0;
  const porcentajeDos = total ? Math.round((dos / total) * 100) : 0;
  const porcentajeUno = total ? Math.round((uno / total) * 100) : 0;

  const promedio =
    userReviews.length > 0
      ? (
          userReviews.reduce((acc, r) => acc + (r.calificacion || 0), 0) /
          userReviews.length
        ).toFixed(1)
      : '0.0';

  useEffect(() => {
    // Obtener usuario logueado
    AuthService.getCurrentUser().then(setCurrentUser);
    // Cargar resenas desde backend
    cargarResenas();
  }, []);

  const cargarResenas = async () => {
    try {
      const res = await obtenerResenas();
      setUserReviews(res);
    } catch (e) {
      // Manejo de error opcional
    }
  };

  const handleAddReview = async () => {
    if (!userComment || userRating === 0 || !currentUser) return;
    try {
      await crearResena({
        usuarioId: currentUser.id,
        calificacion: userRating,
        comentario: userComment,
      });
      setUserComment('');
      setUserRating(0);
      cargarResenas();
    } catch (e) {
      // Manejo de error opcional
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Ionicons
        key={index}
        name={index < rating ? 'star' : 'star-outline'}
        size={16}
        color={index < rating ? '#FFD700' : '#DDD'}
        style={{ marginRight: 2 }}
      />
    ));
  };

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
            <Ionicons name="star" size={32} color="#D4AF37" />
          </View>
          {/* Círculos decorativos */}
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />
          <View style={styles.circle4} />
        </View>

        {/* Sección de valoración general */}
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingTitle}>Valora Nuestra Marca</Text>
          <View style={styles.overallRating}>
            <Text style={styles.ratingNumber}>{promedio}</Text>
            <View style={styles.starsContainer}>
              {renderStars(5)}
            </View>
            <Text style={styles.ratingText}>Basado en {userReviews.length} reseñas</Text>
          </View>
        </View>

        {/* Estadísticas de calificación */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Distribución de Calificaciones</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>5 estrellas</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '75%' }]} />
            </View>
            <Text style={styles.statsPercent}>{porcentajeCinco}%</Text>
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statsLabel}>4 estrellas</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '25%' }]} />
            </View>
            <Text style={styles.statsPercent}>{porcentajeCuatro}%</Text>
          </View>
        </View>

        {/* Sección para agregar reseña */}
        <View style={styles.addReviewContainer}>
          <Text style={styles.addReviewTitle}>
            {currentUser ? `Hola, ${currentUser.nombre} ¡Cuéntanos tu experiencia!` : 'Agrega tu reseña'}
          </Text>
          <TextInput
            style={[styles.input, { height: 60 }]}
            placeholder="¿Qué opinas de nuestra marca?"
            value={userComment}
            onChangeText={setUserComment}
            multiline
          />
          <View style={styles.ratingInputRow}>
            <Text style={styles.ratingInputLabel}>Tu calificación:</Text>
            <View style={styles.ratingInputStars}>
              {Array.from({ length: 5 }, (_, i) => (
                <TouchableOpacity key={i} onPress={() => setUserRating(i + 1)}>
                  <Ionicons
                    name={i < userRating ? 'star' : 'star-outline'}
                    size={24}
                    color={i < userRating ? '#FFD700' : '#DDD'}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <TouchableOpacity style={styles.addReviewButton} onPress={handleAddReview}>
            <Text style={styles.addReviewButtonText}>Enviar reseña</Text>
          </TouchableOpacity>
        </View>

        {/* Reseñas de clientes */}
        <View style={styles.reviewsContainer}>
          <Text style={styles.reviewsTitle}>Opiniones de Nuestros Clientes</Text>
          {userReviews.map((review: any) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewerInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {review.usuario && review.usuario.nombre ? review.usuario.nombre.charAt(0) : '?'}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.reviewerName}>{review.usuario && review.usuario.nombre ? review.usuario.nombre : 'Usuario'}</Text>
                    <View style={styles.starsRow}>
                      {renderStars(review.calificacion)}
                    </View>
                  </View>
                </View>
                <Text style={styles.reviewDate}>{review.fechaResena ? new Date(review.fechaResena).toLocaleDateString() : ''}</Text>
              </View>
              <Text style={styles.reviewComment}>{review.comentario}</Text>
            </View>
          ))}
        </View>

        {/* Sección ODS */}
        <View style={styles.odsContainer}>
          <Text style={styles.odsTitle}>Compromiso con el Desarrollo Sostenible</Text>
          <View style={styles.odsCard}>
            <View style={styles.odsHeader}>
              <Ionicons name="leaf" size={24} color="#5CAC40" />
              <Text style={styles.odsSubtitle}>Objetivos de Desarrollo Sostenible</Text>
            </View>
            <Text style={styles.odsText}>
              El proyecto responde alineándose con los Objetivos de Desarrollo Sostenible (ODS), 
              específicamente el <Text style={styles.odsHighlight}>ODS 9</Text> (Industria, Innovación e Infraestructura) 
              y el <Text style={styles.odsHighlight}>ODS 12</Text> (Producción y Consumo Responsables).
            </Text>
          </View>
        </View>

        {/* Info de contacto y legal/compras */}
        <View style={styles.footerContainer}>
          <View style={styles.footerColumns}>
            <View style={styles.footerColumn}>
              <Text style={styles.footerTitle}>Información legal</Text>
              <Text style={styles.footerItem}>-Términos y Condiciones</Text>
              <Text style={styles.footerItem}>-Política de Garantía</Text>
              <Text style={styles.footerItem}>-Política de Envío y Devolución</Text>
              <Text style={styles.footerItem}>-Derecho de Retracto</Text>
              <Text style={styles.footerItem}>-TyC Marketplace</Text>
              <Text style={styles.footerItem}>-Política de datos</Text>
              <Text style={styles.footerItem}>-Garantías y Devoluciones</Text>
              <Text style={styles.footerItem}>-Políticas de Compra Exterior</Text>
            </View>
            <View style={styles.footerColumn}>
              <Text style={styles.footerTitle2}>Sobre tus compras</Text>
              <Text style={styles.footerItem}>Pagos</Text>
              <Text style={styles.footerItem}>A Dónde Enviamos</Text>
            </View>
          </View>
          <View style={styles.contactInfoFooter}>
            <Text style={styles.contactInfoText}>Contacto: info@arthome.com | +123 456 7890</Text>
          </View>
          <View style={styles.paymentIcons}>
            <TouchableOpacity onPress={() => Linking.openURL('https://facebook.com/')}> 
              <Ionicons name="logo-facebook" size={32} color="#3b5998" style={styles.paymentIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL('mailto:info@arthome.com')}> 
              <Ionicons name="mail" size={32} color="#EA4335" style={styles.paymentIcon} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => Linking.openURL('https://google.com/')}> 
              <Ionicons name="logo-google" size={32} color="#4285F4" style={styles.paymentIcon} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Botón flotante de WhatsApp */}
        <TouchableOpacity
          style={styles.whatsappButton}
          onPress={() => Linking.openURL('https://wa.me/573208424371')}
        >
          <Ionicons name="logo-whatsapp" size={38} color="#fff" />
        </TouchableOpacity>

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
  ratingContainer: {
    marginTop: 40,
    paddingHorizontal: 25,
    alignItems: 'center',
    width: '100%',
  },
  ratingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: 1,
  },
  overallRating: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 20,
    width: '90%',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#5CAC40',
    marginBottom: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  statsCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 18,
    width: '90%',
    marginTop: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5CAC40',
    marginBottom: 15,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsLabel: {
    width: 80,
    fontSize: 14,
    color: '#333',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginHorizontal: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5CAC40',
    borderRadius: 4,
  },
  statsPercent: {
    width: 40,
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
  },
  reviewsContainer: {
    width: '90%',
    marginTop: 30,
  },
  reviewsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5CAC40',
    marginBottom: 20,
    textAlign: 'center',
  },
  reviewCard: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#8EF0A0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5CAC40',
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: 'row',
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewComment: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  odsContainer: {
    width: '90%',
    marginTop: 30,
    marginBottom: 20,
  },
  odsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 20,
    textAlign: 'center',
  },
  odsCard: {
    backgroundColor: '#fff',
    padding: 22,
    borderRadius: 18,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 5,
    borderLeftColor: '#5CAC40',
  },
  odsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  odsSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5CAC40',
    marginLeft: 10,
  },
  odsText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
    marginBottom: 15,
  },
  odsHighlight: {
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  footerContainer: {
    width: '100%',
    marginTop: 30,
    marginBottom: 10,
    alignItems: 'center',
  },
  footerColumns: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 10,
  },
  footerColumn: {
    flex: 1,
    alignItems: 'flex-start',
    paddingHorizontal: 18,
  },
  footerTitle: {
    color: '#D4AF37',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 6,
  },
  footerTitle2: {
    color: '#D4AF37',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 6,
    opacity: 0.7,
  },
  footerItem: {
    color: '#222',
    fontSize: 15,
    marginBottom: 2,
  },
  contactInfoFooter: {
    marginTop: 8,
    marginBottom: 8,
  },
  contactInfoText: {
    color: '#5CAC40',
    fontSize: 15,
    textAlign: 'center',
  },
  paymentIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  paymentIcon: {
    width: 32,
    height: 20,
    marginHorizontal: 6,
    resizeMode: 'contain',
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
  addReviewContainer: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    width: '90%',
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addReviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#5CAC40',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F8FFF4',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#8EF0A0',
    padding: 10,
    fontSize: 15,
    marginBottom: 10,
  },
  ratingInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingInputLabel: {
    fontSize: 15,
    color: '#5CAC40',
    marginRight: 10,
  },
  ratingInputStars: {
    flexDirection: 'row',
  },
  addReviewButton: {
    backgroundColor: '#5CAC40',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  addReviewButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  whatsappButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#25D366',
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    zIndex: 100,
  },
}); 