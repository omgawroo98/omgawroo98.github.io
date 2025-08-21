// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  root: 'project',                 // our app lives in /project
  publicDir: 'project/public',     // copy this folder as-is
  build: {
    outDir: '../dist',             // output to /dist at repo root
    emptyOutDir: true
  },
  base: '/'      
});
