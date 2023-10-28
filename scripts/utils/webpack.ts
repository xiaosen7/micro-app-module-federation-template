import autoprefixer from 'autoprefixer';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

import type { Configuration } from 'webpack';

export namespace webpackUtils {
  export function createCssConfig(): Configuration {
    return {
      module: {
        rules: [
          {
            test: /\.css$/,
            use: createCssLoaders()
          }
        ]
      }
    };
  }

  export function createLessConfig(): Configuration {
    return {
      module: {
        rules: [
          {
            test: /\.less$/,
            use: createLessLoaders()
          }
        ]
      }
    };
  }
}

function createCssLoaders(extract?: boolean) {
  return [
    extract && MiniCssExtractPlugin.loader,
    {
      loader: 'css-loader',
      options: {
        modules: {
          localIdentName: '[local]-[hash:base64:10]'
        },
        sourceMap: true
      }
    },
    {
      loader: 'postcss-loader',
      options: {
        postcssOptions: {
          plugins: ['tailwindcss', ['postcss-preset-env', autoprefixer()]]
        }
      }
    }
  ].filter(Boolean);
}

function createLessLoaders(extract?: boolean) {
  return [
    ...createCssLoaders(extract),
    {
      loader: 'less-loader',
      options: {
        lessOptions: {
          javascriptEnabled: true
        }
      }
    }
  ];
}
