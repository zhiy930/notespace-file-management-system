import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],

  preview: {
    allowedHosts : ['outstanding-surprise-production-f135.up.railway.app']
  }
})
