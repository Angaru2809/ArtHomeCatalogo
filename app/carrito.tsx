import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ProductoCarrito, useCarrito } from '../context/CarritoContext';

export default function CarritoScreen() {
  const { carrito, quitarDelCarrito, limpiarCarrito, agregarAlCarrito } = useCarrito();
  const router = useRouter();

  // Disminuir cantidad
  const disminuirCantidad = (item: ProductoCarrito) => {
    if (item.cantidad > 1) {
      quitarDelCarrito(item.id);
      // Volver a agregar con cantidad - 1
      for (let i = 0; i < item.cantidad - 1; i++) {
        agregarAlCarrito({ ...item, cantidad: 1 });
      }
    } else {
      quitarDelCarrito(item.id);
    }
  };

  // Aumentar cantidad
  const aumentarCantidad = (item: ProductoCarrito) => {
    agregarAlCarrito({ ...item, cantidad: 1 });
  };

  const realizarCompra = () => {
    router.push('/direccionEnvio');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Carrito de compras</Text>
      {carrito.length === 0 ? (
        <Text style={styles.vacio}>Tu carrito está vacío.</Text>
      ) : (
        <FlatList
          data={carrito}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <Text style={styles.nombre}>{item.nombre}</Text>
              <View style={styles.cantidadContainer}>
                <TouchableOpacity onPress={() => disminuirCantidad(item)} style={styles.cantidadBtn}>
                  <Ionicons name="remove-circle-outline" size={22} color="#5CAC40" />
                </TouchableOpacity>
                <Text style={styles.cantidad}>{item.cantidad}</Text>
                <TouchableOpacity onPress={() => aumentarCantidad(item)} style={styles.cantidadBtn}>
                  <Ionicons name="add-circle-outline" size={22} color="#5CAC40" />
                </TouchableOpacity>
              </View>
              <Text style={styles.precio}>${item.precio}</Text>
              <TouchableOpacity onPress={() => quitarDelCarrito(item.id)}>
                <Ionicons name="trash" size={22} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
      {carrito.length > 0 && (
        <TouchableOpacity style={styles.realizarCompra} onPress={realizarCompra}>
          <Text style={styles.textoRealizarCompra}>Realizar compra</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0', padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#5CAC40', marginBottom: 18, textAlign: 'center' },
  vacio: { color: '#888', fontSize: 16, textAlign: 'center', marginTop: 40 },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  nombre: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1 },
  cantidadContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 8 },
  cantidadBtn: { padding: 4 },
  cantidad: { fontSize: 16, color: '#5CAC40', marginHorizontal: 6, minWidth: 20, textAlign: 'center' },
  precio: { fontSize: 15, color: '#D4AF37', marginLeft: 8 },
  realizarCompra: { backgroundColor: '#A6E9A6', paddingVertical: 16, borderRadius: 20, alignItems: 'center', marginTop: 18 },
  textoRealizarCompra: { color: '#247524', fontWeight: 'bold', fontSize: 18 },
}); 