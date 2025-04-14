import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  base: '/Gear-Tracker/', // <- isso aqui é essencial!
  plugins: [react()],
})