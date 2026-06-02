import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      include: ['src'],
      exclude: ['src/App.tsx', 'src/main.tsx', 'src/vite-env.d.ts'],
      tsconfigPath: './tsconfig.app.json',
      compilerOptions: {
        noEmit: false,
        declaration: true,
        emitDeclarationOnly: true
      }
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'RedNorteUI',
      formats: ['es', 'umd'],
      fileName: (format) => `rednorte-frontend.${format === 'es' ? 'js' : 'umd.cjs'}`
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  }
})
