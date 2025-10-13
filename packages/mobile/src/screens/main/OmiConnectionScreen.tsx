import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { omiBluetoothService, OmiDevice } from '../../services/omiBluetoothService';

export default function OmiConnectionScreen() {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<OmiDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<OmiDevice | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Intentar reconectar al dispositivo guardado al montar
    const attemptReconnect = async () => {
      try {
        console.log('[UI] Checking for saved device...');
        const device = await omiBluetoothService.reconnectToSavedDevice();
        if (device) {
          console.log('[UI] Reconnected to saved device:', device.name);
          setConnectedDevice(device);
        }
      } catch (error) {
        console.error('[UI] Error reconnecting to saved device:', error);
      }
    };

    attemptReconnect();

    // Cleanup al desmontar
    return () => {
      omiBluetoothService.stopScan();
    };
  }, []);

  const handleStartScan = async () => {
    try {
      setIsScanning(true);
      setDevices([]);

      await omiBluetoothService.scanForOmiDevices(
        (device) => {
          // Si el dispositivo ya está conectado, establecerlo automáticamente
          if (device.isConnected && !connectedDevice) {
            console.log('[UI] Auto-connecting to already connected device:', device.name);
            handleConnectDevice(device);
          }

          setDevices((prevDevices) => {
            // Evitar duplicados
            const exists = prevDevices.find((d) => d.id === device.id);
            if (exists) {
              return prevDevices;
            }
            return [...prevDevices, device];
          });
        },
        10 // 10 segundos de escaneo
      );

      // El escaneo se detiene automáticamente después de 10 segundos
      setTimeout(() => {
        setIsScanning(false);
      }, 10000);
    } catch (error: any) {
      setIsScanning(false);
      Alert.alert(
        'Error',
        error.message || 'No se pudo iniciar el escaneo de dispositivos'
      );
    }
  };

  const handleStopScan = () => {
    omiBluetoothService.stopScan();
    setIsScanning(false);
  };

  const handleConnectDevice = async (device: OmiDevice) => {
    try {
      setIsConnecting(true);

      const connectedOmi = await omiBluetoothService.connectToDevice(device.id);
      setConnectedDevice(connectedOmi);

      Alert.alert(
        'Conectado',
        `Dispositivo Omi "${connectedOmi.name || 'Sin nombre'}" conectado exitosamente`
      );
    } catch (error: any) {
      Alert.alert(
        'Error de conexión',
        error.message || 'No se pudo conectar al dispositivo'
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await omiBluetoothService.disconnect();
      setConnectedDevice(null);
      Alert.alert('Desconectado', 'El dispositivo Omi ha sido desconectado');
    } catch (error) {
      Alert.alert('Error', 'No se pudo desconectar el dispositivo');
    }
  };

  const renderDevice = ({ item }: { item: OmiDevice }) => (
    <TouchableOpacity
      style={[
        styles.deviceCard,
        item.isConnected && styles.deviceCardConnected,
      ]}
      onPress={() => handleConnectDevice(item)}
      disabled={isConnecting}
    >
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name || 'Dispositivo Omi'}</Text>
        <Text style={styles.deviceId}>ID: {item.id.substring(0, 8)}...</Text>
        <Text style={styles.deviceRssi}>Señal: {item.rssi} dBm</Text>
        {item.isConnected && (
          <Text style={styles.deviceConnectedBadge}>Ya conectado</Text>
        )}
      </View>
      <View style={[
        styles.connectButton,
        item.isConnected && styles.reconnectButton,
      ]}>
        <Text style={styles.connectButtonText}>
          {item.isConnected ? 'Reconectar' : 'Conectar'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Conectar dispositivo Omi</Text>
        <Text style={styles.subtitle}>
          Detecta y conecta tu dispositivo Omi mediante Bluetooth
        </Text>
      </View>

      {/* Estado de conexión */}
      {connectedDevice && (
        <View style={styles.connectedCard}>
          <View style={styles.connectedIndicator} />
          <View style={styles.connectedInfo}>
            <Text style={styles.connectedTitle}>Dispositivo conectado</Text>
            <Text style={styles.connectedName}>
              {connectedDevice.name || 'Dispositivo Omi'}
            </Text>
            {connectedDevice.batteryLevel !== undefined && (
              <Text style={styles.connectedBattery}>
                Batería: {connectedDevice.batteryLevel}%
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.disconnectButton}
            onPress={handleDisconnect}
          >
            <Text style={styles.disconnectButtonText}>Desconectar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Botón de escaneo */}
      <View style={styles.scanSection}>
        {!isScanning ? (
          <TouchableOpacity
            style={[styles.scanButton, connectedDevice && styles.scanButtonDisabled]}
            onPress={handleStartScan}
            disabled={!!connectedDevice}
          >
            <Text style={styles.scanButtonText}>
              {connectedDevice ? 'Desconecta para escanear' : 'Buscar dispositivos Omi'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopButton} onPress={handleStopScan}>
            <ActivityIndicator color="#FFF" style={styles.scanningIndicator} />
            <Text style={styles.stopButtonText}>Escaneando... (Detener)</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de dispositivos */}
      {devices.length > 0 && !connectedDevice && (
        <View style={styles.listContainer}>
          <Text style={styles.listTitle}>
            Dispositivos encontrados ({devices.length})
          </Text>
          <FlatList
            data={devices}
            renderItem={renderDevice}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
          />
        </View>
      )}

      {/* Estado vacío */}
      {devices.length === 0 && !isScanning && !connectedDevice && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Presiona "Buscar dispositivos Omi" para comenzar
          </Text>
          <Text style={styles.emptySubtext}>
            Asegúrate de que tu dispositivo Omi esté encendido y cerca
          </Text>
        </View>
      )}

      {/* Loading de conexión */}
      {isConnecting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Conectando...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  connectedCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  connectedIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    marginRight: 12,
  },
  connectedInfo: {
    flex: 1,
  },
  connectedTitle: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  connectedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 2,
  },
  connectedBattery: {
    fontSize: 12,
    color: '#10B981',
  },
  disconnectButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disconnectButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  scanSection: {
    marginBottom: 24,
  },
  scanButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  scanButtonDisabled: {
    backgroundColor: '#374151',
  },
  scanButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  stopButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  scanningIndicator: {
    marginRight: 8,
  },
  stopButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    flex: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  list: {
    paddingBottom: 20,
  },
  deviceCard: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#374151',
  },
  deviceCardConnected: {
    borderColor: '#10B981',
    borderWidth: 2,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  deviceRssi: {
    fontSize: 12,
    color: '#6B7280',
  },
  deviceConnectedBadge: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '600',
    marginTop: 4,
  },
  connectButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reconnectButton: {
    backgroundColor: '#10B981',
  },
  connectButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 16,
    marginTop: 12,
  },
});
