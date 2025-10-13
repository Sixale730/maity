import { BleManager, Device, State, Subscription } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// UUIDs del dispositivo Omi (basados en el repositorio oficial)
export const OMI_SERVICE_UUID = '19b10000-e8f2-537e-4f6c-d104768a1214';
export const BATTERY_SERVICE_UUID = '0000180f-0000-1000-8000-00805f9b34fb';
export const BATTERY_LEVEL_CHAR_UUID = '00002a19-0000-1000-8000-00805f9b34fb';
export const DEVICE_INFO_SERVICE_UUID = '0000180a-0000-1000-8000-00805f9b34fb';

const CONNECTED_DEVICE_KEY = '@omi_connected_device';

export interface OmiDevice {
  id: string;
  name: string | null;
  rssi: number;
  isConnected: boolean;
  batteryLevel?: number;
  firmwareVersion?: string;
}

export type ConnectionStatusListener = (device: OmiDevice | null) => void;

class OmiBluetoothService {
  private bleManager: BleManager;
  private connectedDevice: Device | null = null;
  private scanningTimeout: NodeJS.Timeout | null = null;
  private disconnectionSubscription: Subscription | null = null;
  private connectionListeners: Set<ConnectionStatusListener> = new Set();

  constructor() {
    this.bleManager = new BleManager();
  }

  /**
   * Verifica si Bluetooth está habilitado en el dispositivo
   */
  async isBluetoothEnabled(): Promise<boolean> {
    const state = await this.bleManager.state();
    return state === State.PoweredOn;
  }

  /**
   * Solicita permisos de Bluetooth en Android
   */
  async requestAndroidPermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') {
      return true;
    }

    try {
      if (Platform.Version >= 31) {
        // Android 12+
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return (
          granted['android.permission.BLUETOOTH_SCAN'] === 'granted' &&
          granted['android.permission.BLUETOOTH_CONNECT'] === 'granted' &&
          granted['android.permission.ACCESS_FINE_LOCATION'] === 'granted'
        );
      } else {
        // Android < 12
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === 'granted';
      }
    } catch (error) {
      console.error('Error requesting Android permissions:', error);
      return false;
    }
  }

  /**
   * Escanea dispositivos Omi cercanos
   * @param onDeviceFound - Callback que se ejecuta cuando se encuentra un dispositivo
   * @param timeoutSeconds - Tiempo máximo de escaneo en segundos (default: 10)
   */
  async scanForOmiDevices(
    onDeviceFound: (device: OmiDevice) => void,
    timeoutSeconds: number = 10
  ): Promise<void> {
    // Verificar permisos
    const hasPermissions = await this.requestAndroidPermissions();
    if (!hasPermissions) {
      throw new Error('Permisos de Bluetooth no otorgados');
    }

    // Verificar si Bluetooth está habilitado
    const isEnabled = await this.isBluetoothEnabled();
    if (!isEnabled) {
      throw new Error('Bluetooth no está habilitado');
    }

    // Detener escaneo anterior si existe
    this.stopScan();

    // Mapa para evitar duplicados
    const discoveredDevices = new Map<string, boolean>();

    // PRIMERO: Buscar dispositivos ya conectados (importantes si la app se recargó)
    try {
      // Intentar primero con el filtro de servicio
      let connectedDevices = await this.bleManager.connectedDevices([OMI_SERVICE_UUID]);
      console.log('[Omi] Found connected devices with UUID filter:', connectedDevices.length);

      // Si no encuentra con filtro, intentar sin filtro (buscar todos)
      if (connectedDevices.length === 0) {
        const allConnectedDevices = await this.bleManager.connectedDevices([]);
        console.log('[Omi] Found ALL connected devices:', allConnectedDevices.length);

        // Filtrar manualmente los que sean Omi (por nombre o verificar servicios)
        for (const device of allConnectedDevices) {
          console.log('[Omi] Checking device:', device.name, device.id);

          // Verificar si tiene el servicio Omi
          try {
            const services = await device.services();
            const hasOmiService = services.some(
              s => s.uuid.toLowerCase() === OMI_SERVICE_UUID.toLowerCase()
            );

            if (hasOmiService) {
              console.log('[Omi] Device has Omi service!');
              connectedDevices.push(device);
            }
          } catch (e) {
            console.log('[Omi] Could not check services for device:', device.id);
          }
        }
      }

      for (const device of connectedDevices) {
        if (!discoveredDevices.has(device.id)) {
          discoveredDevices.set(device.id, true);

          const omiDevice: OmiDevice = {
            id: device.id,
            name: device.name,
            rssi: device.rssi || 0,
            isConnected: true, // Ya está conectado
          };

          console.log('[Omi] Reporting already connected device:', device.name || device.id);
          onDeviceFound(omiDevice);
        }
      }
    } catch (error) {
      console.error('[Omi] Error checking connected devices:', error);
    }

    // SEGUNDO: Iniciar escaneo de nuevos dispositivos
    this.bleManager.startDeviceScan(
      [OMI_SERVICE_UUID], // Filtrar solo dispositivos con el servicio Omi
      null,
      (error, device) => {
        if (error) {
          console.error('Error during scan:', error);
          return;
        }

        if (device && !discoveredDevices.has(device.id)) {
          discoveredDevices.set(device.id, true);

          const omiDevice: OmiDevice = {
            id: device.id,
            name: device.name,
            rssi: device.rssi || 0,
            isConnected: false,
          };

          onDeviceFound(omiDevice);
        }
      }
    );

    // Detener escaneo después del timeout
    this.scanningTimeout = setTimeout(() => {
      this.stopScan();
    }, timeoutSeconds * 1000);
  }

  /**
   * Detiene el escaneo de dispositivos
   */
  stopScan(): void {
    if (this.scanningTimeout) {
      clearTimeout(this.scanningTimeout);
      this.scanningTimeout = null;
    }
    this.bleManager.stopDeviceScan();
  }

  /**
   * Conecta a un dispositivo Omi específico
   * @param deviceId - ID del dispositivo a conectar
   */
  async connectToDevice(deviceId: string): Promise<OmiDevice> {
    try {
      // Detener escaneo si está activo
      this.stopScan();

      // Desconectar dispositivo anterior si existe
      if (this.connectedDevice) {
        await this.disconnect();
      }

      // Conectar al dispositivo
      console.log('[Omi] Connecting to device:', deviceId);
      const device = await this.bleManager.connectToDevice(deviceId);
      await device.discoverAllServicesAndCharacteristics();

      this.connectedDevice = device;

      const omiDevice: OmiDevice = {
        id: device.id,
        name: device.name,
        rssi: device.rssi || 0,
        isConnected: true,
      };

      // Intentar leer información adicional
      try {
        const batteryLevel = await this.readBatteryLevel(device);
        if (batteryLevel !== null) {
          omiDevice.batteryLevel = batteryLevel;
        }
      } catch (error) {
        console.log('[Omi] No se pudo leer el nivel de batería');
      }

      // Guardar el dispositivo conectado en AsyncStorage
      await this.saveConnectedDevice(omiDevice);
      console.log('[Omi] Device connected and saved:', omiDevice.name);

      // Notificar a los listeners
      this.notifyConnectionListeners(omiDevice);

      return omiDevice;
    } catch (error) {
      console.error('[Omi] Error connecting to device:', error);
      throw new Error('No se pudo conectar al dispositivo Omi');
    }
  }

  /**
   * Desconecta el dispositivo actual
   */
  async disconnect(): Promise<void> {
    if (this.connectedDevice) {
      try {
        await this.bleManager.cancelDeviceConnection(this.connectedDevice.id);
        await AsyncStorage.removeItem(CONNECTED_DEVICE_KEY);
        console.log('[Omi] Device disconnected and removed from storage');
      } catch (error) {
        console.error('[Omi] Error disconnecting:', error);
      } finally {
        this.connectedDevice = null;
        this.notifyConnectionListeners(null);
      }
    }
  }

  /**
   * Obtiene el dispositivo conectado actualmente
   */
  getConnectedDevice(): Device | null {
    return this.connectedDevice;
  }

  /**
   * Verifica si hay un dispositivo conectado
   */
  isConnected(): boolean {
    return this.connectedDevice !== null;
  }

  /**
   * Lee el nivel de batería del dispositivo (si está disponible)
   */
  private async readBatteryLevel(device: Device): Promise<number | null> {
    try {
      const services = await device.services();
      const batteryService = services.find(
        (s) => s.uuid.toLowerCase() === BATTERY_SERVICE_UUID.toLowerCase()
      );

      if (!batteryService) {
        console.log('[Omi] Battery service not found');
        return null;
      }

      const characteristics = await batteryService.characteristics();
      console.log('[Omi] Battery characteristics:', characteristics.map(c => c.uuid));

      // Buscar específicamente la característica de nivel de batería
      const batteryChar = characteristics.find(
        (c) => c.uuid.toLowerCase() === BATTERY_LEVEL_CHAR_UUID.toLowerCase()
      ) || characteristics[0]; // Fallback a la primera si no encuentra la específica

      if (!batteryChar) {
        console.log('[Omi] Battery characteristic not found');
        return null;
      }

      console.log('[Omi] Reading battery from characteristic:', batteryChar.uuid);
      const value = await batteryChar.read();

      if (value.value) {
        console.log('[Omi] Raw battery value (base64):', value.value);

        // Decodificar base64 a número (compatible con React Native)
        try {
          const decoded = atob(value.value);
          console.log('[Omi] Decoded battery string length:', decoded.length);

          // Leer el primer byte como número sin signo
          const batteryLevel = decoded.charCodeAt(0);
          console.log('[Omi] Battery level decoded:', batteryLevel);

          // Validar que esté en el rango 0-100
          if (batteryLevel >= 0 && batteryLevel <= 100) {
            return batteryLevel;
          } else {
            console.warn('[Omi] Battery level out of range:', batteryLevel);
            return null;
          }
        } catch (e) {
          console.error('[Omi] Error decoding base64:', e);
          return null;
        }
      }

      return null;
    } catch (error) {
      console.error('[Omi] Error reading battery level:', error);
      return null;
    }
  }

  /**
   * Guarda el dispositivo conectado en AsyncStorage
   */
  private async saveConnectedDevice(device: OmiDevice): Promise<void> {
    try {
      await AsyncStorage.setItem(CONNECTED_DEVICE_KEY, JSON.stringify(device));
    } catch (error) {
      console.error('[Omi] Error saving connected device:', error);
    }
  }

  /**
   * Obtiene el dispositivo conectado guardado
   */
  async getSavedConnectedDevice(): Promise<OmiDevice | null> {
    try {
      const data = await AsyncStorage.getItem(CONNECTED_DEVICE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('[Omi] Error getting saved device:', error);
    }
    return null;
  }

  /**
   * Intenta reconectar al dispositivo guardado
   */
  async reconnectToSavedDevice(): Promise<OmiDevice | null> {
    const savedDevice = await this.getSavedConnectedDevice();
    if (!savedDevice) {
      console.log('[Omi] No saved device to reconnect');
      return null;
    }

    try {
      console.log('[Omi] Attempting to reconnect to saved device:', savedDevice.name);
      const device = await this.connectToDevice(savedDevice.id);
      return device;
    } catch (error) {
      console.error('[Omi] Failed to reconnect to saved device:', error);
      // Limpiar el dispositivo guardado si falló la reconexión
      await AsyncStorage.removeItem(CONNECTED_DEVICE_KEY);
      return null;
    }
  }

  /**
   * Agrega un listener para cambios en el estado de conexión
   */
  addConnectionListener(listener: ConnectionStatusListener): void {
    this.connectionListeners.add(listener);
  }

  /**
   * Remueve un listener
   */
  removeConnectionListener(listener: ConnectionStatusListener): void {
    this.connectionListeners.delete(listener);
  }

  /**
   * Notifica a los listeners sobre cambios de conexión
   */
  private notifyConnectionListeners(device: OmiDevice | null): void {
    this.connectionListeners.forEach(listener => listener(device));
  }

  /**
   * Limpia y destruye el manager de BLE
   */
  destroy(): void {
    this.stopScan();
    this.disconnect();
    this.bleManager.destroy();
  }
}

// Exportar instancia singleton
export const omiBluetoothService = new OmiBluetoothService();
