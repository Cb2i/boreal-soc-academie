/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Base relative ('./') : fonctionne à la racine d'un domaine comme dans un
// sous-répertoire (GitHub Pages : https://utilisateur.github.io/depot/).
// La navigation utilise le hash ('#/...'), donc aucun fichier 404.html
// ni réécriture serveur n'est nécessaire.
// Surcharge possible : VITE_BASE=/mon-depot/ npm run build
export default defineConfig({
  base: process.env.VITE_BASE ?? './',
  plugins: [react()],
  build: { target: 'es2022', sourcemap: false },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx', 'src/**/*.test.ts'],
  },
});
