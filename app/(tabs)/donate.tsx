import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, FlatList, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import authService from '../../services/auth.service';
import { ContribucionData, contribucionService } from '../../services/contribucion.service';

const { width } = Dimensions.get('window');

// Datos de ejemplo para el banner
const bannerImages = [
  { id: 1, source: require('@/assets/images/banner8.jpeg') },
  { id: 2, source: require('@/assets/images/banner2.jpg') },
  { id: 3, source: require('@/assets/images/banner3.jpg') },
  { id: 4, source: require('@/assets/images/banner4.jpg') },
  { id: 5, source: require('@/assets/images/banner5.jpg') },
  { id: 6, source: require('@/assets/images/banner6.jpg') },
];

export default function DonateScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [material, setMaterial] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const flatListRef = useRef<FlatList>(null);

  // Estados para validaciones
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    phone: '',
    material: '',
    quantity: '',
    description: ''
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
    material: false,
    quantity: false,
    description: false
  });

  // Cargar información del usuario al montar el componente
  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      setCurrentUser(user);
      // console.log('👤 Usuario cargado - ID:', user?.id, 'Nombre:', user?.nombre);
    } catch (error) {
      // console.error('❌ Error cargando usuario:', error);
    }
  };

  // Funciones de validación
  const validateField = (fieldName: string, value: string) => {
    let error = '';

    switch (fieldName) {
      case 'name':
        if (!value.trim()) {
          error = 'El nombre es requerido';
        } else if (value.trim().length < 3) {
          error = 'El nombre debe tener al menos 3 caracteres';
        } else if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(value.trim())) {
          error = 'El nombre solo puede contener letras';
        }
        break;

      case 'email':
        if (!value.trim()) {
          error = 'El email es requerido';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          error = 'Ingresa un email válido';
        }
        break;

      case 'phone':
        if (!value.trim()) {
          error = 'El teléfono es requerido';
        } else {
          const phoneDigits = value.replace(/\D/g, ''); // Solo números
          if (phoneDigits.length < 10 || phoneDigits.length > 12) {
            error = 'El teléfono debe tener entre 10 y 12 números';
          }
        }
        break;

      case 'material':
        if (!value.trim()) {
          error = 'El tipo de material es requerido';
        } else if (value.trim().length < 3) {
          error = 'El material debe tener al menos 3 caracteres';
        } else if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(value.trim())) {
          error = 'El material solo puede contener letras';
        }
        break;

      case 'quantity':
        if (!value.trim()) {
          error = 'La cantidad es requerida';
        } else if (!/^\d+$/.test(value.trim())) {
          error = 'La cantidad solo puede contener números';
        } else if (parseInt(value) <= 0) {
          error = 'La cantidad debe ser mayor a 0';
        }
        break;

      case 'description':
        if (value.trim().length > 150) {
          error = 'La descripción no puede exceder 150 caracteres';
        }
        break;
    }

    return error;
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    // Actualizar el valor del campo
    switch (fieldName) {
      case 'name':
        setName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'phone':
        setPhone(value);
        break;
      case 'material':
        setMaterial(value);
        break;
      case 'quantity':
        setQuantity(value);
        break;
      case 'description':
        setDescription(value);
        break;
    }

    // Marcar el campo como tocado
    setTouched(prev => ({ ...prev, [fieldName]: true }));

    // Validar el campo
    const error = validateField(fieldName, value);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  const handleFieldBlur = (fieldName: string) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const value = fieldName === 'name' ? name : 
                  fieldName === 'email' ? email :
                  fieldName === 'phone' ? phone :
                  fieldName === 'material' ? material :
                  fieldName === 'quantity' ? quantity :
                  description;
    
    const error = validateField(fieldName, value);
    setErrors(prev => ({ ...prev, [fieldName]: error }));
  };

  // Función para cambiar automáticamente las imágenes
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % bannerImages.length;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleSubmit = async () => {
    try {
      // Validar que el usuario esté autenticado
      if (!currentUser) {
        Alert.alert(
          'Error',
          'Debes iniciar sesión para realizar una donación',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Iniciar Sesión', onPress: () => router.push('/login') }
          ]
        );
        return;
      }

      // Marcar todos los campos como tocados para mostrar errores
      setTouched({
        name: true,
        email: true,
        phone: true,
        material: true,
        quantity: true,
        description: true
      });

      // Validar todos los campos
      const newErrors = {
        name: validateField('name', name),
        email: validateField('email', email),
        phone: validateField('phone', phone),
        material: validateField('material', material),
        quantity: validateField('quantity', quantity),
        description: validateField('description', description)
      };

      setErrors(newErrors);

      // Verificar si hay errores
      const hasErrors = Object.values(newErrors).some(error => error !== '');
      if (hasErrors) {
        Alert.alert('Error', 'Por favor corrige los errores en el formulario');
        return;
      }

      // Validaciones adicionales antes de enviar
      if (!name.trim() || !email.trim() || !phone.trim() || !material.trim() || !quantity.trim()) {
        Alert.alert('Error', 'Por favor completa todos los campos requeridos');
        return;
      }

      // Preparar datos para enviar al backend
      const contribucionData: ContribucionData = {
        nombreDonante: name.trim(),
        correoDonante: email.trim(),
        tipoMaterial: material.trim(),
        descripcion: description.trim(),
        cantidad: parseInt(quantity),
        telefono: phone.trim()
      };

      // console.log('📝 Enviando contribución - Nombre:', contribucionData.nombreDonante);
      // console.log('📝 Enviando contribución - Email:', contribucionData.correoDonante);
      // console.log('📝 Enviando contribución - Material:', contribucionData.tipoMaterial);

      // Mostrar indicador de carga
      Alert.alert(
        'Enviando donación...',
        'Por favor espera mientras procesamos tu donación',
        [],
        { cancelable: false }
      );

      // Enviar al backend
      try {
        const contribucion = await contribucionService.createContribucion(contribucionData);
        // console.log('✅ Contribución creada - ID:', contribucion?.id);

        // Mostrar mensaje de éxito
        Alert.alert(
          '¡Éxito!',
          'Tu donación ha sido enviada correctamente. Te contactaremos pronto.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Limpiar formulario y errores
                setName('');
                setEmail('');
                setPhone('');
                setMaterial('');
                setQuantity('');
                setDescription('');
                setErrors({
                  name: '',
                  email: '',
                  phone: '',
                  material: '',
                  quantity: '',
                  description: ''
                });
                setTouched({
                  name: false,
                  email: false,
                  phone: false,
                  material: false,
                  quantity: false,
                  description: false
                });
              }
            }
          ]
        );
      } catch (backendError) {
        // Si el backend no está disponible, mostrar mensaje específico
        if (backendError instanceof Error && backendError.message.includes('Failed to fetch')) {
          Alert.alert(
            'Servidor no disponible',
            'El servidor backend no está corriendo. Por favor inicia el servidor y vuelve a intentar.',
            [
              { text: 'Entendido', style: 'cancel' },
              { 
                text: 'Reintentar', 
                onPress: () => handleSubmit() 
              }
            ]
          );
        } else {
          throw backendError; // Re-lanzar otros errores
        }
      }

    } catch (error) {
      // console.error('❌ Error enviando contribución:', error);
      
      let errorMessage = 'Error al enviar la donación';
      
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('no autenticado')) {
          errorMessage = 'Sesión expirada. Por favor inicia sesión nuevamente.';
        } else if (error.message.includes('400')) {
          errorMessage = 'Datos inválidos. Por favor verifica la información.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Error del servidor. Por favor intenta más tarde.';
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert(
        'Error',
        errorMessage,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Reintentar', 
            onPress: () => handleSubmit() 
          }
        ]
      );
    }
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

  const renderBannerItem = ({ item }: { item: typeof bannerImages[0] }) => (
    <View style={styles.bannerItem}>
      <Image source={item.source} style={styles.bannerImage} contentFit="cover" />
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Mensaje de advertencia si no está logueado */}
      {!currentUser && (
        <View style={styles.authWarning}>
          <Ionicons name="warning" size={18} color="#FF6B35" />
          <ThemedText style={styles.authWarningText}>
            Inicia sesión para poder donar
          </ThemedText>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Sé Sostenible</ThemedText>
        <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
          <Ionicons
            name="person-circle"
            size={32}
            color={currentUser ? '#D4AF37' : '#BDBDBD'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner deslizable */}
        <View style={styles.bannerContainer}>
          <FlatList
            ref={flatListRef}
            data={bannerImages}
            renderItem={renderBannerItem}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id.toString()}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentIndex(newIndex);
            }}
            getItemLayout={(data, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            scrollEnabled={true}
            nestedScrollEnabled={true}
          />
          {/* Indicadores de página */}
          <View style={styles.pagination}>
            {bannerImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Contenido del formulario */}
        <View style={styles.formContainer}>
          <ThemedText style={styles.subtitle}>
            Ayúdanos a crear más muebles reciclados
          </ThemedText>

          <View style={styles.form}>
            {/* Formulario de ingreso */}
            {[
              { 
                icon: 'person-outline', 
                placeholder: 'Nombre completo', 
                value: name, 
                fieldName: 'name',
                multiline: false 
              },
              { 
                icon: 'mail-outline', 
                placeholder: 'Correo electrónico', 
                value: email, 
                fieldName: 'email',
                multiline: false 
              },
              { 
                icon: 'call-outline', 
                placeholder: 'Teléfono', 
                value: phone, 
                fieldName: 'phone',
                multiline: false 
              },
              { 
                icon: 'cube-outline', 
                placeholder: 'Tipo de material', 
                value: material, 
                fieldName: 'material',
                multiline: false 
              },
              { 
                icon: 'scale-outline', 
                placeholder: 'Cantidad aproximada', 
                value: quantity, 
                fieldName: 'quantity',
                multiline: false 
              },
              { 
                icon: 'document-text-outline', 
                placeholder: 'Descripción adicional', 
                value: description, 
                fieldName: 'description',
                multiline: true 
              },
            ].map(({ icon, placeholder, value, fieldName, multiline }, index) => (
              <View key={index} style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>{placeholder}</ThemedText>
                <View style={[
                  styles.inputContainer,
                  touched[fieldName as keyof typeof touched] && errors[fieldName as keyof typeof errors] && styles.inputError
                ]}>
                  <Ionicons 
                    name={icon as any} 
                    size={20} 
                    color={touched[fieldName as keyof typeof touched] && errors[fieldName as keyof typeof errors] ? "#FF6B35" : "#D4AF37"} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={[styles.input, multiline && styles.textArea]}
                    placeholder={placeholder}
                    value={value}
                    onChangeText={(text) => handleFieldChange(fieldName, text)}
                    onBlur={() => handleFieldBlur(fieldName)}
                    multiline={multiline}
                    numberOfLines={multiline ? 4 : 1}
                    textAlignVertical="top"
                    placeholderTextColor="#999"
                  />
                </View>
                {touched[fieldName as keyof typeof touched] && errors[fieldName as keyof typeof errors] && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={14} color="#FF6B35" />
                    <ThemedText style={styles.errorText}>
                      {errors[fieldName as keyof typeof errors]}
                    </ThemedText>
                  </View>
                )}
                {fieldName === 'description' && (
                  <View style={styles.charCounter}>
                    <ThemedText style={styles.charCounterText}>
                      {`${description.length}/150`}
                    </ThemedText>
                  </View>
                )}
              </View>
            ))}

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <ThemedText style={styles.buttonText}>Enviar Donación</ThemedText>
            </TouchableOpacity>

            <ThemedText style={styles.invitationText}>
              Te invitamos a ayudarnos, sé sostenible, cualquier grano importa.
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  profileButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1D3D47',
    flex: 1,
    textAlign: 'left',
    marginLeft: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  bannerContainer: {
    height: 200,
    backgroundColor: 'rgba(92, 172, 64, 0.1)', // Fondo traslúcido verde
    marginHorizontal: 0,
    marginTop: 0,
    marginBottom: 10,
    borderRadius: 12,
    shadowColor: '#D4AF37',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.4)', // Borde semitransparente
    overflow: 'hidden',
  },
  bannerItem: {
    width: width, // Usar todo el ancho disponible
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF', // Fondo del slide blanco
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 5,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  paginationDotActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#1D3D47',
    shadowColor: '#D4AF37',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  formContainer: {
    padding: 20,
    backgroundColor: '#F8F9FA',
    marginHorizontal: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D3D47',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1D3D47',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#1D3D47',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
    paddingBottom: 12,
  },
  button: {
    backgroundColor: '#5CAC40',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4.65,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  authWarning: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 249, 230, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#FFD700',
    zIndex: 1000,
  },
  authWarningText: {
    fontSize: 14,
    color: '#FF6B35',
    marginLeft: 8,
    fontWeight: '500',
  },
  inputError: {
    borderColor: '#FF6B35',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#FF6B35',
    marginLeft: 8,
  },
  charCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  charCounterText: {
    fontSize: 12,
    color: '#666',
  },
  charCounterTextError: {
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  invitationText: {
    fontSize: 14,
    color: '#5CAC40',
    marginTop: 20,
    textAlign: 'center',
    fontStyle: 'italic',
    fontWeight: '500',
  },
});
