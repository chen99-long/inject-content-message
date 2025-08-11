import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default [
  // ES Module build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.esm.js',
      format: 'es',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      typescript({
        module: 'esnext',
        declaration: false
      })
    ]
  },
  // CommonJS build
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.cjs.js',
      format: 'cjs',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      typescript({
        module: 'esnext',
        declaration: false
      })
    ]
  },
  // UMD build (for script tag)
  {
    input: 'src/umd.ts',
    output: {
      file: 'dist/index.umd.js',
      format: 'umd',
      name: 'InjectContentMessage',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      typescript({
        module: 'esnext',
        declaration: false
      })
    ]
  },
  // UMD minified build
  {
    input: 'src/umd.ts',
    output: {
      file: 'dist/index.umd.min.js',
      format: 'umd',
      name: 'InjectContentMessage',
      sourcemap: true
    },
    plugins: [
      nodeResolve(),
      typescript({
        module: 'esnext',
        declaration: false
      }),
      terser()
    ]
  },
  // TypeScript declarations (separate build)
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es'
    },
    plugins: [
      typescript({
        module: 'esnext',
        declaration: true,
        emitDeclarationOnly: true,
        outDir: 'dist'
      })
    ]
  }
];
