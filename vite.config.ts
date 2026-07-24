import { defineConfig } from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
   AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
   }),
       AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      resolvers: [ElementPlusResolver()],
      dts: 'src/auto-imports.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  server: {
    host: true,
    port: 5130,
    open: true,
    cors: true,
    proxy: {
      // 将 /oneths 开头的请求代理到后端，避免跨域问题
      '/oneths': {
        target: 'http://192.168.110.25:1024',
        changeOrigin: true,
      },
    },
  },
})
