import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { buscarProductosPorNombre, getAllProductos, getCategorias, getProductoImageSource, getProductosPorCategoriaNombre } from '../../services/catalog.service';

// Tipos explícitos
type Categoria = {
  id: number;
  nombre: string;
  descripcion?: string;
};

type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad_stock: number;
  estadoStock: string;
  imagenUrl?: string;
  categoria?: Categoria;
};

// IDs de categorías (ajusta según tus datos reales)
const CATEGORIAS_FILTRO = [
  { nombre: 'Todos' },
  { nombre: 'Sillas' },
  { nombre: 'Mesas' },
  { nombre: 'Decoración' },
  { nombre: 'Personalizados' },
];

export default function CatalogScreen() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('Todos');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [sugerencias, setSugerencias] = useState<Producto[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const router = useRouter();

  // Cargar categorías al iniciar
  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const data = await getCategorias();
        setCategorias(Array.isArray(data.categorias) ? data.categorias : []);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
        setError('Error al cargar categorías');
      }
    };
    cargarCategorias();
  }, []);

  // Cargar productos según la categoría seleccionada
  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setLoading(true);
        setError(null);
        let productosData;
        if (categoriaSeleccionada === 'Todos') {
          productosData = await getAllProductos();
        } else {
          const data = await getProductosPorCategoriaNombre(categoriaSeleccionada);
          productosData = data.productos;
        }
        setProductos(Array.isArray(productosData) ? productosData : []);
      } catch (error) {
        console.error('Error al cargar productos:', error);
        setError('Error al cargar productos');
      } finally {
        setLoading(false);
      }
    };
    cargarProductos();
  }, [categoriaSeleccionada]);

  // Buscar productos por nombre
  const handleBuscar = async () => {
    if (busqueda.trim() === '') return;
    setLoading(true);
    setError(null);
    setMostrarSugerencias(false);
    try {
      const data = await buscarProductosPorNombre(busqueda);
      setProductos(Array.isArray(data.productos) ? data.productos : []);
    } catch (error) {
      setError('Error al buscar productos');
    } finally {
      setLoading(false);
    }
  };

  // Sugerencias de búsqueda (autocomplete)
  const handleChangeBusqueda = async (texto: string) => {
    setBusqueda(texto);
    if (texto.trim().length > 0) {
      const data = await buscarProductosPorNombre(texto);
      setSugerencias(Array.isArray(data.productos) ? data.productos.slice(0, 5) : []);
      setMostrarSugerencias(true);
    } else {
      setSugerencias([]);
      setMostrarSugerencias(false);
    }
  };

  // Si se borra la búsqueda, recarga productos por categoría
  useEffect(() => {
    if (busqueda === '') {
      // Reutiliza la lógica de cargar productos por categoría
      if (categoriaSeleccionada === 'Todos') {
        getAllProductos().then(setProductos);
      } else {
        getProductosPorCategoriaNombre(categoriaSeleccionada).then(data => setProductos(Array.isArray(data.productos) ? data.productos : []));
      }
    }
  }, [busqueda, categoriaSeleccionada]);

  const getProductoImagenSource = (producto: Producto) => getProductoImageSource(producto as any);

  // Banner dinámico según categoría
  let bannerSource = require('../../assets/images/bannerprin.png');
  let bannerStyle = styles.bannerImageBannerPrin;

  if (categoriaSeleccionada === 'Decoración') {
    bannerSource = require('../../assets/images/bannerprin2.png');
    bannerStyle = styles.bannerImageBannerPrin2;
  } else if (categoriaSeleccionada === 'Mesas') {
    bannerSource = require('../../assets/images/bannerprin3.png');
    bannerStyle = styles.bannerImageBannerPrin3;
  } else if (categoriaSeleccionada === 'Personalizados') {
    bannerSource = require('../../assets/images/bannerprin4.png');
    bannerStyle = styles.bannerImageBannerPrin4;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
            style={styles.retryButton}
                onPress={() => router.replace('/(tabs)/catalogo')}
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={{ flex: 1 }}>
        {/* Header personalizado */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.headerIconLeft}>
            <Ionicons name="menu" size={28} color="#5CAC40" />
          </TouchableOpacity>
          <View style={styles.headerLogoContainer}>
            <Image source={require('../../assets/images/LogoArt.png')} style={styles.headerLogo} resizeMode="contain" />
            <Text style={styles.headerSlogan}>Diseña emociones</Text>
          </View>
          <TouchableOpacity style={styles.headerIconRight} onPress={() => router.push('/carrito')}>
            <Ionicons name="cart-outline" size={26} color="#5CAC40" />
          </TouchableOpacity>
        </View>

        {/* Banner principal */}
        <View style={styles.bannerContainer}>
          <Image
            source={bannerSource}
            style={bannerStyle}
            resizeMode="contain"
          />
        </View>

        {/* Buscador */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar..."
            placeholderTextColor="#888"
            value={busqueda}
            onChangeText={handleChangeBusqueda}
            onSubmitEditing={handleBuscar}
            returnKeyType="search"
          />
          <TouchableOpacity style={styles.filterButton} onPress={handleBuscar}>
            <Ionicons name="search" size={20} color="#5CAC40" />
          </TouchableOpacity>
        </View>

        {/* Sugerencias de búsqueda */}
        {mostrarSugerencias && sugerencias.length > 0 && (
          <View style={styles.sugerenciasContainer}>
            {sugerencias.map((prod) => (
              <TouchableOpacity
                key={prod.id}
                style={styles.sugerenciaItem}
                onPress={() => {
                  setBusqueda(prod.nombre);
                  setMostrarSugerencias(false);
                  handleBuscar();
                }}
              >
                <Text style={styles.sugerenciaText}>{prod.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Tabs de categorías deslizable */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
          {CATEGORIAS_FILTRO.map((cat) => (
            <TouchableOpacity
              key={cat.nombre}
              style={[
                styles.tabButton,
                categoriaSeleccionada === cat.nombre && styles.tabButtonActive,
              ]}
              onPress={() => setCategoriaSeleccionada(cat.nombre)}
            >
              <Text
                style={[
                  styles.tabText,
                  categoriaSeleccionada === cat.nombre && styles.tabTextActive,
                ]}
              >
                {cat.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Grid de productos */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#5CAC40" />
            <Text style={styles.loadingText}>Cargando productos...</Text>
          </View>
        ) : (
          <FlatList
            data={productos}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.productsGrid}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.productCard}
                onPress={() => router.push(`/productoDetalle?id=${item.id}`)}
              >
                <View style={styles.productImageContainer}>
                  {getProductoImagenSource(item) && (
                    <Image
                      source={getProductoImagenSource(item) as any}
                      style={styles.productImage}
                      resizeMode="contain"
                    />
                  )}
                </View>
                <Text style={styles.productName}>{item.nombre}</Text>
                <Text style={styles.productPrice}>${item.precio}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No se encontraron productos</Text>
              </View>
            }
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FFF8F0' },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 10,
    marginBottom: 2,
  },
  headerIconLeft: {
    width: 40,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerIconRight: {
    width: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  headerLogoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLogo: {
    width: 120,
    height: 40,
    marginBottom: 0,
    marginTop: 18,
  },
  headerSlogan: {
    fontSize: 14,
    color: '#D4AF37', // dorado más intenso como en contribuciones
    fontWeight: '600',
    marginTop: -7,
    letterSpacing: 1,
  },
  bannerContainer: { 
    width: '100%', 
    height: 245, 
    marginBottom: 45, 
    backgroundColor: '#D6F5D6', // verde claro tipo elipses
    alignItems: 'center', 
    justifyContent: 'center',
  },
  bannerImage: { 
    width: '200%', 
    height: '200%', 
    borderRadius: 16,
    marginTop: 100,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    paddingHorizontal: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
    backgroundColor: 'transparent',
  },
  filterButton: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 16,
    backgroundColor: '#F2F2F2',
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#F2F2F2',
    marginHorizontal: 4,
  },
  tabButtonActive: {
    backgroundColor: '#5CAC40',
  },
  tabText: {
    color: '#888',
    fontWeight: 'bold',
  },
  tabTextActive: {
    color: '#FFF',
  },
  productsGrid: {
    paddingHorizontal: 8,
    paddingBottom: 20,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    margin: 8,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  productImageContainer: {
    width: 100,
    height: 100,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  productPrice: {
    color: '#5CAC40',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    marginTop: 10,
    color: '#888',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF0000',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#5CAC40',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bannerImageBannerPrin: { 
    width: 750, 
    height: 520, 
    borderRadius: 16,
    marginTop: 130,
  },
  bannerImageBannerPrin2: { 
    width: 800, // o el ancho que prefieras
    height: 370, // o el alto que prefieras
    borderRadius: 16,
    marginTop: 20, // ajusta según lo que se vea mejor
  },
  bannerImageBannerPrin3: { 
    width: 500, 
    height: 250, 
    borderRadius: 16,
    marginTop: -4,
  },
  bannerImageBannerPrin4: { 
    width: 320, 
    height: 180, 
    borderRadius: 16,
    marginTop: 40,
  },
  sugerenciasContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginHorizontal: 32,
    marginTop: -8,
    elevation: 30,
    zIndex: 20,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 420, // justo debajo del input
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 1 },
  },
  sugerenciaItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sugerenciaText: {
    color: '#333',
    fontSize: 14,
  },
});
