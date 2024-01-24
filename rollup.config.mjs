import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

const packages = ['defer-abort', 'defer-of', 'fold', 'loop', 'loop-scan', 'react-hooks', 'safe-map', 'with-abort'];
export default packages.map(pkg => ({
  input: `packages/${pkg}/src/index.ts`,
  output: [{
    file: `packages/${pkg}/dist/index.mjs`,
    format: 'es',
  }, {
    file: `packages/${pkg}/dist/index.js`,
    format: 'cjs',
  }],
  plugins: [typescript({
    declaration: true,
    declarationDir: `packages/${pkg}/dist`,
    include: [`packages/${pkg}/src/**/*.ts`],
    module: 'ESNext',
  }), terser()],
  external: ['rxjs', 'react'],
}));

