import axios from 'axios';
import React, { useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCarrito } from '../context/CarritoContext';
import authService from '../services/auth.service';
import { getApiBaseUrl } from '../services/api.config';

const METODOS_PAGO = ['Efectivo', 'Tarjeta', 'Transferencia'];

export default function PedidosScreen({ navigation, route }: { navigation: any, route: any }) {
  const { carrito, limpiarCarrito } = useCarrito();
  const [metodoPago, setMetodoPago] = useState(METODOS_PAGO[0]);
  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const [confirmando, setConfirmando] = useState(false);
  const direccion_envio_id = route?.params?.direccion_envio_id;

  const confirmarPedido = async () => {
    if (!direccion_envio_id) {
      Alert.alert('Debes registrar una dirección de envío antes de confirmar el pedido.');
      return;
    }
    setConfirmando(true);
    try {
      const token = await authService.getAccessToken();
      await axios.post(`${getApiBaseUrl()}/api/pedidos`, {
        direccion_envio_id,
        productos: carrito.map(item => ({ producto_id: item.id, cantidad: item.cantidad })),
        total,
        estado_pago: 'pendiente',
        metodo_pago: metodoPago
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConfirmando(false);
      limpiarCarrito();
      Alert.alert('¡Pedido realizado!', 'Tu pedido ha sido registrado correctamente. Pronto recibirás confirmación.');
      navigation.navigate('catalogo');
    } catch (error: any) {
      setConfirmando(false);
      Alert.alert('Error', error.response?.data?.error || 'No se pudo realizar el pedido');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.titulo}>Resumen de tu pedido</Text>
      <FlatList
        data={carrito}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <Text style={styles.cantidad}>x{item.cantidad}</Text>
            <Text style={styles.precio}>${item.precio * item.cantidad}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.vacio}>No hay productos en tu pedido.</Text>}
      />
      <Text style={styles.total}>Total a pagar: <Text style={{ color: '#247524', fontWeight: 'bold' }}>${total}</Text></Text>
      <Text style={styles.subtitulo}>Método de pago:</Text>
      <View style={styles.metodosPago}>
        {METODOS_PAGO.map((metodo) => (
          <TouchableOpacity
            key={metodo}
            style={[styles.metodoBtn, metodoPago === metodo && styles.metodoBtnActivo]}
            onPress={() => setMetodoPago(metodo)}
          >
            <Text style={[styles.metodoTexto, metodoPago === metodo && styles.metodoTextoActivo]}>{metodo}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.confirmarBtn} onPress={confirmarPedido} disabled={confirmando}>
        <Text style={styles.confirmarTexto}>{confirmando ? 'Confirmando...' : 'Confirmar pedido'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0', padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#5CAC40', marginBottom: 8, textAlign: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  nombre: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1 },
  cantidad: { fontSize: 15, color: '#5CAC40', marginLeft: 8 },
  precio: { fontSize: 15, color: '#D4AF37', marginLeft: 8 },
  total: { fontSize: 18, color: '#333', fontWeight: 'bold', marginTop: 10, marginBottom: 10, textAlign: 'center' },
  subtitulo: { fontSize: 16, color: '#333', marginTop: 10, marginBottom: 4, fontWeight: 'bold' },
  metodosPago: { flexDirection: 'row', justifyContent: 'center', marginBottom: 18 },
  metodoBtn: { backgroundColor: '#E6F9E6', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 20, marginHorizontal: 6 },
  metodoBtnActivo: { backgroundColor: '#5CAC40' },
  metodoTexto: { color: '#5CAC40', fontWeight: 'bold', fontSize: 15 },
  metodoTextoActivo: { color: '#fff' },
  confirmarBtn: { backgroundColor: '#A6E9A6', paddingVertical: 16, borderRadius: 20, alignItems: 'center', marginTop: 18 },
  confirmarTexto: { color: '#247524', fontWeight: 'bold', fontSize: 18 },
  vacio: { color: '#888', fontSize: 16, textAlign: 'center', marginTop: 40 },
}); 