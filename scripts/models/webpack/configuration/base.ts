import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import merge from 'webpack-merge';

import type { Configuration } from 'webpack';

export abstract class WebpackConfiguration {
  get(): Configuration {
    return {
      entry: {
        main: './src/index.tsx'
      },
      cache: {
        type: 'filesystem'
      },
      module: {
        rules: [
          {
            test: /\.(j|t)sx?$/,
            use: [
              {
                loader: require.resolve('swc-loader'),
                options: {
                  jsc: {
                    transform: {
                      react: {
                        runtime: 'automatic'
                      }
                    }
                  }
                }
              }
            ]
          }
        ]
      },
      resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        plugins: [new TsconfigPathsPlugin()]
      }
    };
  }

  merge(configuration: Configuration) {
    return merge(this.get(), configuration);
  }
}
