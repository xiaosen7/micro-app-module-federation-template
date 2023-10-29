/* eslint-disable prettier/prettier */

import { take } from 'rxjs';
import { EAppDevSocketType } from 'scripts/types';
import { pathUtils } from 'scripts/utils/paths';

import { invariantUtils } from '../../../utils/invariant';
import { ProjectFactory } from '../../factories/project';

import type { Project } from '../../project/project';
import type WebpackDevServer from 'webpack-dev-server';
import type { Configuration } from 'webpack-dev-server';
import type { WebSocket } from 'ws';

export const setupMiddlewares: Configuration['setupMiddlewares'] = (middlewares, server) => {
  invariantUtils.define(server.app);
  const appMap = new AppMap();
  waitWebsocketInitialized(server).then(() => {
    invariantUtils.define(server.webSocketServer);
    server.webSocketServer.implementation.on('connection', (socket) => {
      setupNewSocket(server, socket, appMap);
    });
  });

  return middlewares;
};

async function setupNewSocket(server: WebpackDevServer, socket: WebSocket, appMap: AppMap) {
  socket.on('message', async (buffer) => {
    const rawData = JSON.parse(buffer.toString());
    const { type, data } = rawData;
    server.logger.info(`receive: type - ${type}, data - ${data}`);

    const logRunningApps = () => {
      const runningApps = appMap.getRunningAppNames();
      if (runningApps.length > 0) {
        server.logger.info(`当前正在运行的微应用： ${appMap.getRunningAppNames().join('、')}`);
      } else {
        server.logger.info(`当前没有正在运行的微应用`);
      }
    };

    switch (type) {
      case EAppDevSocketType.StartApp: {
        const appName = data as IAppName;
        if (!appMap.has(appName)) {
          appMap.set(appName, ProjectFactory.create(undefined, pathUtils.getAppProjectDir(appName)));
        }

        const appProject = appMap.get(appName)!;
        await appProject.serve();

        appProject.started$.pipe(take(1)).subscribe(() => {
          socket.send(
            JSON.stringify({
              type: EAppDevSocketType.AppStarted,
              data: appName
            })
          );
          logRunningApps();
        });
        break;
      }

      case EAppDevSocketType.CloseApp: {
        const appName = data as IAppName;
        const appProject = appMap.get(appName);
        invariantUtils.define(appProject);
        appProject.stopServe();

        appProject.stopped$.pipe(take(1)).subscribe(() => {
          logRunningApps();
          socket.send(
            JSON.stringify({
              type: EAppDevSocketType.AppClosed,
              data: appName
            })
          );
        });
        break;
      }

      case EAppDevSocketType.AppInactive: {
        // const appName = data as IAppName;
        // appMap.get(appName)?.inactive();
        break;
      }

      case EAppDevSocketType.AppActive: {
        // const appName = data as IAppName;
        // appMap.get(appName)?.active();
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

function waitWebsocketInitialized(server: WebpackDevServer) {
  return new Promise((rs) => {
    setInterval(() => {
      if (server.webSocketServer) {
        rs(null);
      }
    }, 1000);
  });
}

class AppMap extends Map<IAppName, Project> {
  getRunningAppNames() {
    return Array.from(this.keys()).filter((name) => this.get(name)?.isServing);
  }
}
