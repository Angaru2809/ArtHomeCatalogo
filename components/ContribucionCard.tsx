import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Contribucion } from '../services/contribucion.service';
import { ThemedText } from './ThemedText';

interface ContribucionCardProps {
  contribucion: Contribucion;
  onPress?: () => void;
}

export const ContribucionCard: React.FC<ContribucionCardProps> = ({ contribucion, onPress }) => {
  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return '#FFA500';
      case 'aprobada':
        return '#5CAC40';
      case 'rechazada':
        return '#FF6B35';
      case 'completada':
        return '#1D3D47';
      default:
        return '#999';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return 'time-outline';
      case 'aprobada':
        return 'checkmark-circle-outline';
      case 'rechazada':
        return 'close-circle-outline';
      case 'completada':
        return 'checkmark-done-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.materialInfo}>
          <Ionicons name="cube-outline" size={20} color="#D4AF37" />
          <ThemedText style={styles.materialText}>
            {contribucion.tipoMaterial}
          </ThemedText>
        </View>
        <View style={[styles.estadoBadge, { backgroundColor: getEstadoColor(contribucion.estado) }]}>
          <Ionicons 
            name={getEstadoIcon(contribucion.estado) as any} 
            size={14} 
            color="#FFF" 
          />
          <ThemedText style={styles.estadoText}>
            {contribucion.estado}
          </ThemedText>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={16} color="#666" />
          <ThemedText style={styles.infoText}>
            {contribucion.nombreDonante}
          </ThemedText>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={16} color="#666" />
          <ThemedText style={styles.infoText}>
            {contribucion.correoDonante}
          </ThemedText>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={16} color="#666" />
          <ThemedText style={styles.infoText}>
            {contribucion.telefono}
          </ThemedText>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="scale-outline" size={16} color="#666" />
          <ThemedText style={styles.infoText}>
            Cantidad: {contribucion.cantidad}
          </ThemedText>
        </View>

        <View style={styles.descriptionContainer}>
          <Ionicons name="document-text-outline" size={16} color="#666" />
          <ThemedText style={styles.descriptionText} numberOfLines={3}>
            {contribucion.descripcion}
          </ThemedText>
        </View>
      </View>

      <View style={styles.footer}>
        <Ionicons name="calendar-outline" size={14} color="#999" />
        <ThemedText style={styles.dateText}>
          {formatDate(contribucion.fechaContribucion)}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  materialInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  materialText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1D3D47',
    marginLeft: 8,
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  content: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 6,
  },
}); 