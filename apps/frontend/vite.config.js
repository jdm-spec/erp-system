import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '');

  return {
    root: '.',
    envDir: __dirname,
    server: {
      port: 3000,
      open: false
    },
    build: {
      target: 'esnext',
      outDir: 'dist',
      emptyOutDir: true
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src')
      }
    },
    define: {
      __DATA_ADAPTER__: JSON.stringify(env.VITE_DATA_ADAPTER || 'firebase'),
      __FIREBASE_CONFIG__: JSON.stringify({
        apiKey: env.VITE_FIREBASE_API_KEY || '',
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || '',
        databaseURL: env.VITE_FIREBASE_DATABASE_URL || '',
        projectId: env.VITE_FIREBASE_PROJECT_ID || '',
        storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: env.VITE_FIREBASE_APP_ID || ''
      })
    }
  };
});

