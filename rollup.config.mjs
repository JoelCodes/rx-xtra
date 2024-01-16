// rollup.config.js
import typescript from '@rollup/plugin-typescript';
const packages = ['defer-abort', 'loop', 'loop-scan'];
export default packages.map(pkg => ({
  input: `packages/${pkg}/src/index.ts`,
  output: [{
    file: `packages/${pkg}/dist/index.mjs`,
    format: 'es'
  }, {
    file: `packages/${pkg}/dist/index.js`,
    format: 'cjs'
  }],
  plugins: [typescript({
    declaration: true,
    declarationDir: `packages/${pkg}/dist`,
    include: [`packages/${pkg}/src/**/*.ts`]
  })],
  external: ['rxjs']
}));

