/* eslint-disable prettier/prettier */
import { EOL } from 'os';

import chalk from 'chalk';
import * as execa from 'execa';
import { EAppDevSocketType } from 'scripts/types';
import { pathUtils } from 'scripts/utils/paths';

import { invariantUtils } from '../../../utils/invariant';

import type { ExecaChildProcess } from 'execa';
import type Server from 'webpack-dev-server';
import type { Configuration } from 'webpack-dev-server';
import type { WebSocket } from 'ws';

export const setupMiddlewares: Configuration['setupMiddlewares'] = (middlewares, server) => {
  invariantUtils.define(server.app);
  const appMap = new AppMap();
  waitWebsocketInitialized(server).then(() => {
    invariantUtils.define(server.webSocketServer);
    server.webSocketServer.implementation.on('connection', (socket) => {
      console.log(chalk.green(`Dev socket: connected`) + EOL);
      setupNewSocket(socket, appMap);
    });
  });

  return middlewares;
};

async function setupNewSocket(socket: WebSocket, appMap: AppMap) {
  socket.on('message', async (buffer) => {
    const rawData = JSON.parse(buffer.toString());
    const { type, data } = rawData;
    console.log(chalk.cyan(`Dev socket: type - ${type}, data - ${data}`) + EOL);

    switch (type) {
      case EAppDevSocketType.StartApp: {
        const appName = data as IAppName;
        if (!appMap.has(appName)) {
          appMap.set(appName, new AppProcess(appName));
        }

        const appProcess = appMap.get(appName)!;
        appMap.set(appName, appProcess);

        const afterCreate = (childProcess: ExecaChildProcess) => {
          const onMessage = (message: string) => {
            if (message.includes('started successfully')) {
              console.log(chalk.cyan(`Dev socket: 当前正在运行的微应用： ${appMap.getRunningAppNames()}`) + EOL);
              socket.send(
                JSON.stringify({
                  type: EAppDevSocketType.AppStarted,
                  data: appName
                })
              );
            }
          };

          childProcess.stdout!.on('data', (buffer) => {
            const message = buffer.toString();
            appProcess.log(message);
            onMessage(message);
          });

          childProcess.stderr!.on('data', (buffer) => {
            const message = buffer.toString();
            appProcess.logError(message);
            onMessage(message);
          });
        };

        await appProcess.runStart(afterCreate);
        appMap.set(appName, appProcess);
        break;
      }

      case EAppDevSocketType.CloseApp: {
        const appName = data as IAppName;
        appMap.get(appName)?.close();
        console.log(chalk.cyan(`Dev socket: 当前正在运行的微应用： ${appMap.getRunningAppNames()}`) + EOL);
        socket.send(
          JSON.stringify({
            type: EAppDevSocketType.AppClosed,
            data: appName
          })
        );
        break;
      }

      case EAppDevSocketType.AppInactive: {
        const appName = data as IAppName;
        appMap.get(appName)?.inactive();
        break;
      }

      case EAppDevSocketType.AppActive: {
        const appName = data as IAppName;
        appMap.get(appName)?.active();
        break;
      }

      case EAppDevSocketType.RunningApps: {
        socket.send(
          JSON.stringify({
            type: EAppDevSocketType.RunningApps,
            data: appMap.getRunningAppNames()
          })
        );
        break;
      }

      default:
        break;
    }
  });
}

function waitWebsocketInitialized(server: Server) {
  return new Promise((rs) => {
    setInterval(() => {
      if (server.webSocketServer) {
        rs(null);
      }
    }, 1000);
  });
}

class AppProcess {
  timer: NodeJS.Timeout | null = null;

  private appName: IAppName;
  running: boolean = false;
  private process?: ExecaChildProcess<string>;

  constructor(appName: IAppName) {
    this.appName = appName;
  }

  log(message: string) {
    console.log(chalk.gray(`${this.appName}:\n${message}\n`));
  }

  logError(message: string) {
    console.error(chalk.red(`${this.appName}:\n${message}\n`));
  }

  inactive() {
    if (this.timer !== null) {
      return;
    }

    return;

    // 取消下面注释将开启应用 5分钟后自动关闭
    // this.log('将于 5分钟后关闭');
    // this.timer = setTimeout(
    //   () => {
    //     if (this.process) {
    //       this.process.kill();
    //       this.running = false;
    //       this.log('已关闭');
    //     }
    //   },
    //   1000 * 60 * 5
    // );
  }

  active() {
    if (this.timer !== null) {
      this.log(`重新激活`);
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  async runStart(afterCreate?: (process: ExecaChildProcess) => void) {
    if (this.running) {
      return;
    }

    this.running = true;
    const cmd = `pnpm -F ${this.appName} dev`;
    const childProcess = execa.command(cmd, {
      cwd: pathUtils.workspaceRoot
    });

    this.process = childProcess;
    afterCreate?.(childProcess);
    return childProcess;
  }

  close() {
    this.process?.kill();
    this.log('已关闭');
    this.running = false;
  }
}

class AppMap extends Map<IAppName, AppProcess> {
  getRunningAppNames() {
    return Array.from(this.keys()).filter((name) => this.get(name)?.running);
  }
}
