import path from 'path';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import merge from 'webpack-merge';

import type { Configuration } from 'webpack';

export abstract class WebpackConfiguration {
  constructor(private projectDir: string) {}
  get(): Configuration {
    return {
      entry: {
        main: './src/index.tsx'
      },
      output: {
        clean: true
      },
      cache: {
        type: 'filesystem',
        cacheDirectory: path.resolve(this.projectDir, 'node_modules', '.cache', 'webpack')
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
      plugins: [new HtmlWebpackPlugin()],
      resolve: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        plugins: [
          new TsconfigPathsPlugin({
            configFile: path.resolve(this.projectDir, 'tsconfig.json')
          })
        ]
      },
      context: this.projectDir
    };
  }

  merge(configuration: Configuration) {
    return merge(this.get(), configuration);
  }
}
