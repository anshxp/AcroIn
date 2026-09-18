import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiUrl = process.env.VITE_API_URL?.trim()
const isBuild = process.env.NODE_ENV === 'production'

if (isBuild && (!apiUrl || !/^https:\/\/[^\s/]+/i.test(apiUrl))) {
  throw new Error('Production frontend builds require VITE_API_URL to be an absolute HTTPS URL.')
}

export default defineConfig({
  plugins: [react()],
})
