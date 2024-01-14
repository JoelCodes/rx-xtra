// rollup.config.js
import typescript from '@rollup/plugin-typescript';
const packages = ['loop'];
export default packages.map(pkg => ({
  input: `packages/${pkg}/src/index.ts`,
  output: {
    dir: `packages/${pkg}/dist`,
    format: 'esm'
  },
  plugins: [typescript({
    declaration: true,
    declarationDir: `packages/${pkg}/dist`,
  })]
}));

