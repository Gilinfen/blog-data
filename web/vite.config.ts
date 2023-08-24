import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import qiankun from 'vite-plugin-qiankun'

const env = process.env.VITE_ENV

const packageName = require('./package.json').name
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    env === 'prod' ? react() : void 0,
    qiankun(packageName, {
      useDevMode: true
    })
  ],
  base: env === 'dev' ? 'http://127.0.0.1:5500/' : `/${packageName}/`
})
