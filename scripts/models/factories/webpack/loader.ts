import path from 'path';

import autoprefixer from 'autoprefixer';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import { pathUtils } from '../../../utils/paths';

export namespace WebpackLoaderFactory {
  export function css(extract?: boolean) {
    return [
      extract ? MiniCssExtractPlugin.loader : require.resolve('style-loader'),
      {
        loader: require.resolve('css-loader'),
        options: {
          modules: {
            localIdentName: '[local]-[hash:base64:10]',
            auto: true
          },
          sourceMap: true
        }
      },
      {
        loader: require.resolve('postcss-loader'),
        options: {
          postcssOptions: {
            plugins: [
              ['tailwindcss', { config: path.resolve(pathUtils.workspaceRoot, 'scripts', 'tailwind.config.js') }],
              ['postcss-preset-env', autoprefixer()]
            ]
          }
        }
      }
    ].filter(Boolean);
  }

  export function less(extract?: boolean) {
    return [
      ...css(extract),
      {
        loader: require.resolve('less-loader'),
        options: {
          lessOptions: {
            javascriptEnabled: true
          }
        }
      }
    ];
  }
}
