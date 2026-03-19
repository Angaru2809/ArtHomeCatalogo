import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import authService from '../services/auth.service';

interface Ciudad { id: number; nombre: string; }
interface CodigoPostal { id: number; codigo: string; }

export default function DireccionEnvioScreen({ navigation, route }: { navigation: any, route: any }) {
  const [direccion, setDireccion] = useState('');
  const [ciudadId, setCiudadId] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [telefono, setTelefono] = useState('');
  const [ciudades, setCiudades] = useState<Ciudad[]>([]);
  const [codigosPostales, setCodigosPostales] = useState<CodigoPostal[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:4000/api/ciudades').then(res => setCiudades(res.data));
    axios.get('http://localhost:4000/api/codigos-postales').then(res => setCodigosPostales(res.data));
  }, []);

  const handleCrearDireccion = async () => {
    if (!direccion || !ciudadId || !codigoPostal || !telefono) {
      Alert.alert('Completa todos los campos');
      return;
    }
    setLoading(true);
    try {
      const token = await authService.getAccessToken();
      const response = await axios.post(
        'http://localhost:4000/api/direcciones-envio',
        {
          direccion,
          ciudad_id: ciudadId,
          codigo_postal: codigoPostal,
          telefono_contacto: telefono
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setLoading(false);
      const direccion_envio_id = response.data.id;
      navigation.navigate('pedidos', { direccion_envio_id });
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Error', error.response?.data?.error || 'No se pudo crear la dirección');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Dirección de envío</Text>
      <TextInput
        placeholder="Dirección de envío"
        value={direccion}
        onChangeText={setDireccion}
        style={styles.input}
      />
      <Picker
        selectedValue={ciudadId}
        onValueChange={setCiudadId}
        style={styles.input}
      >
        <Picker.Item label="Selecciona ciudad" value="" />
        {ciudades.map(c => (
          <Picker.Item key={c.id} label={c.nombre} value={c.id.toString()} />
        ))}
      </Picker>
      <TextInput
        style={styles.input}
        placeholder="Código Postal"
        value={codigoPostal}
        onChangeText={setCodigoPostal}
        keyboardType="numeric"
        maxLength={10}
      />
      <TextInput
        placeholder="Teléfono de contacto"
        value={telefono}
        onChangeText={setTelefono}
        keyboardType="phone-pad"
        style={styles.input}
      />
      <TouchableOpacity onPress={handleCrearDireccion} style={styles.boton} disabled={loading}>
        <Text style={styles.textoBoton}>{loading ? 'Guardando...' : 'Guardar dirección'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8F0', padding: 20 },
  titulo: { fontSize: 24, fontWeight: 'bold', color: '#5CAC40', marginBottom: 18, textAlign: 'center' },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 10, fontSize: 16, borderWidth: 1, borderColor: '#E0E0E0' },
  boton: { backgroundColor: '#5CAC40', padding: 14, borderRadius: 10, alignItems: 'center' },
  textoBoton: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
}); 