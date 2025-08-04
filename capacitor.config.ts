
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.carretoplus.app',
  appName: 'Carreto Plus',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
