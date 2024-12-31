import path, { join } from 'path';
import { readFileSync } from 'fs';
import { defineConfig, ExternalOption, Plugin, RollupOptions } from 'rollup';

import del from 'rollup-plugin-delete';
import eslint from '@rollup/plugin-eslint';
import alias from '@rollup/plugin-alias';
import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import nodeExternals from 'rollup-plugin-node-externals';
import nodeResolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import { visualizer } from 'rollup-plugin-visualizer';

export interface CreateConfigOptions {
  packageName: string;
}

export function createConfig({
  packageName,
}: CreateConfigOptions): RollupOptions[] {
  const rootPath: string = process.cwd();
  const packagesPath: string = join(rootPath, './packages');
  const packagePath: string = join(packagesPath, packageName);
  const packageConfigPath: string = join(packagePath, './package.json');
  const packageConfig = JSON.parse(readFileSync(packageConfigPath).toString());
  const srcPath: string = join(packagePath, './src');
  const distPath: string = path.resolve(packagePath, './dist');
  const external: ExternalOption = [
    ...Object.keys({
      ...packageConfig.peerDependencies,
      ...packageConfig.devDependencies,
      ...packageConfig.dependencies,
    }),
  ];

  const analyze = process.env.ANALYZE === 'true';
  let analyzePlugins: Plugin[] = [];
  if (analyze) {
    analyzePlugins = [
      visualizer({
        open: true,
        gzipSize: true,
      }),
    ];
  }

  return [
    {
      input: path.resolve(srcPath, './index.ts'),
      output: [
        {
          dir: distPath,
          format: 'es',
          externalLiveBindings: false,
          preserveModules: true,
          preserveModulesRoot: path.resolve(
            rootPath,
            `packages/${packageName}/src`,
          ),
        },
      ],
      plugins: [
        del({
          targets: [join(distPath, './*')],
          runOnce: true,
        }),
        eslint({
          throwOnError: true,
          cwd: rootPath,
        }),
        alias({
          entries: [{ find: `@/${packageName}`, replacement: srcPath }],
        }),
        typescript({
          tsconfig: join(packagePath, './tsconfig.json'),
          rootDir: srcPath,
          declaration: true,
          declarationDir: distPath,
          exclude: ['./**/*.stories.ts', './**/*.stories.tsx'],
        }),
        commonjs({
          include: 'node_modules/**',
        }),
        nodeExternals(),
        nodeResolve({
          extensions: ['.css', '.ts', '.tsx', '.js', '.jsx'],
        }),
        babel({
          babelHelpers: 'bundled',
          exclude: 'node_modules/**',
          extensions: ['.js', '.ts', '.tsx'],
          presets: ['@babel/preset-react'],
          plugins: [],
        }),
        terser(),
        ...analyzePlugins,
      ],
      external,
    },
  ];
}

export const createUiConfig = () =>
  createConfig({
    packageName: 'react-use-carousel',
  });

// eslint-disable-next-line import/no-default-export
export default defineConfig([...createUiConfig()]);
