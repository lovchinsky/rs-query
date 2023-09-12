import { defineConfig } from 'tsup';

export default defineConfig((options) => {
  const commonOptions = {
    entry: ['src/index.ts'],
    minify: true,
    ...options,
  };

  return [
    {
      ...commonOptions,
      format: ['esm'],
      dts: true,
      clean: true,
      outExtension: () => ({ js: '.mjs' }),
    },
    {
      ...commonOptions,
      entry: {
        'index.legacy-esm': 'src/index.ts',
      },
      format: ['esm'],
      target: 'es2017',
      outExtension: () => ({ js: '.js' }),
    },
    {
      ...commonOptions,
      format: 'cjs',
      outDir: './dist/cjs/',
      outExtension: () => ({ js: '.cjs' }),
    },
  ];
});
