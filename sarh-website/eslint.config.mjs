import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    // React Bits LogoLoop renders partner logos from arbitrary sources (SVG files, external hosts), which
    // next/image cannot optimise without knowing their hosts in advance. A plain <img> is intended there.
    files: ['src/components/react-bits/LogoLoop.tsx'],
    rules: { '@next/next/no-img-element': 'off' }
  },
  globalIgnores(['.next/**', 'next-env.d.ts', 'node_modules/**'])
]);

export default eslintConfig;
