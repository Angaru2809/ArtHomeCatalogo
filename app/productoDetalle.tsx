import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCarrito } from '../context/CarritoContext';
import { getProductoPorId } from '../services/catalog.service';


export default function ProductoDetalleScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [producto, setProducto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { agregarAlCarrito } = useCarrito();

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getProductoPorId(Number(id));
        setProducto(res.producto);
      } catch (e) {
        setError('No se pudo cargar el producto');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProducto();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#5CAC40" />
        <Text style={styles.loadingText}>Cargando producto...</Text>
      </View>
    );
  }

  if (error || !producto) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{error || 'Producto no encontrado'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(tabs)/catalogo')}>
          <Ionicons name="arrow-back" size={28} color="#5CAC40" />
          <Text style={styles.backText}>Volver al catálogo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginHorizontal: 10 }}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(tabs)/catalogo')}>
          <Ionicons name="arrow-back" size={28} color="#5CAC40" />
          <Text style={styles.backText}>Volver al catálogo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.carritoIcon} onPress={() => router.push('/carrito' as const)}>
          <Ionicons name="cart-outline" size={28} color="#5CAC40" />
        </TouchableOpacity>
      </View>
      <Text style={styles.encabezado}>Detalle del producto</Text>
      <View style={styles.cardDecorada}>
        {producto.imagenUrl && (
          <View style={styles.imageShadowBox}>
            <Image source={{ uri: producto.imagenUrl }} style={styles.imageDecorada} resizeMode="contain" />
          </View>
        )}
        <Text style={styles.nombreDecorado}>{producto.nombre}</Text>
        <Text style={styles.precioDecorado}>${producto.precio}</Text>
        {/* Estado visual de stock */}
        {producto.cantidad_stock !== undefined && (
          <View style={
            producto.cantidad_stock === 0
              ? styles.estadoAgotado
              : producto.cantidad_stock < 5
              ? styles.estadoPocasUnidades
              : styles.estadoEnStock
          }>
            <Text style={styles.estadoTexto}>
              {producto.cantidad_stock === 0
                ? 'Agotado'
                : producto.cantidad_stock < 5
                ? '¡Pocas unidades!'
                : 'En stock'}
            </Text>
          </View>
        )}
        {producto.categoria && (
          <Text style={styles.categoriaDecorada}>Categoría: {producto.categoria.nombre}</Text>
        )}
        <Text style={styles.descripcionDecorada}>{producto.descripcion}</Text>
        {producto.cantidad_stock !== undefined && (
          <Text style={styles.stockDecorado}>Stock: {producto.cantidad_stock}</Text>
        )}
        {/* Botón agregar al carrito */}
        <TouchableOpacity style={styles.botonCarrito} onPress={() => agregarAlCarrito({
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          ...producto
        })}>
          <Ionicons name="cart-outline" size={22} color="#fff" />
          <Text style={styles.textoBotonCarrito}>Agregar al carrito</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0' },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginLeft: 10,
    marginBottom: 10,
  },
  backText: {
    color: '#5CAC40',
    fontSize: 16,
    marginLeft: 6,
    fontWeight: 'bold',
  },
  cardDecorada: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#5CAC40',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  imageShadowBox: {
    backgroundColor: '#F6F6F6',
    borderRadius: 18,
    padding: 10,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  imageDecorada: {
    width: 210,
    height: 210,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#5CAC40',
    backgroundColor: '#fff',
  },
  nombreDecorado: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#5CAC40',
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: 1,
  },
  precioDecorado: {
    fontSize: 22,
    color: '#D4AF37',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  estadoEnStock: {
    backgroundColor: '#E6F9E6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#5CAC40',
  },
  estadoPocasUnidades: {
    backgroundColor: '#FFF6E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FFA500',
  },
  estadoAgotado: {
    backgroundColor: '#FFE6E6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  estadoTexto: {
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  categoriaDecorada: {
    fontSize: 16,
    color: '#5CAC40',
    marginBottom: 8,
    fontWeight: '600',
  },
  descripcionDecorada: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 2,
  },
  stockDecorado: {
    fontSize: 15,
    color: '#888',
    marginBottom: 2,
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 },
  loadingText: { color: '#888', fontSize: 16, marginTop: 10 },
  encabezado: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5CAC40',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 18,
    letterSpacing: 1.5,
    textShadowColor: 'rgba(92, 172, 64, 0.15)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  botonCarrito: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5CAC40',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginTop: 18,
    alignSelf: 'center',
    shadowColor: '#5CAC40',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  textoBotonCarrito: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  carritoIcon: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 