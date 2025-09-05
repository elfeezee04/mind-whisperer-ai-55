import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.c5b54df5486b42619d1ea202ea17758b',
  appName: 'mind-whisperer-ai-55',
  webDir: 'dist',
  server: {
    url: 'https://c5b54df5-486b-4261-9d1e-a202ea17758b.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#f0f8ff",
      showSpinner: true,
      spinnerColor: "#4a90e2"
    }
  }
};

export default config;