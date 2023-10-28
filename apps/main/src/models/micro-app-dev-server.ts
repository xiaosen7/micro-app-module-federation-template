import { MicroUtils } from 'modules/@shared/common';
import { Subject, fromEvent } from 'modules/rxjs';
import { EAppDevSocketType } from 'scripts/types';

/**
 * 微前端应用启动器，仅在开发模式下使用
 */
export class MicroAppDevServer {
  private static instance: MicroAppDevServer;

  static get() {
    if (this.instance) {
      return this.instance;
    }

    return (this.instance = new MicroAppDevServer());
  }

  startedApp$ = new Subject<IAppName>();
  closedApp$ = new Subject<IAppName>();

  private ws: WebSocket;
  private isConnected: boolean;

  private constructor() {
    this.ws = new WebSocket(`ws://localhost:${MicroUtils.getAppPort('@apps/main')}/ws`);

    this.isConnected = false;

    fromEvent(this.ws, 'open').subscribe(() => {
      this.isConnected = true;
    });

    fromEvent<MessageEvent>(this.ws, 'message').subscribe((ev) => {
      const rawData = JSON.parse(ev.data);
      const { type, data } = rawData;

      switch (type) {
        case EAppDevSocketType.AppStarted:
          this.startedApp$.next(data);
          break;

        case EAppDevSocketType.AppClosed:
          this.closedApp$.next(data);
          break;

        default:
          break;
      }
    });
  }

  waitConnected() {
    return new Promise((rs) => {
      if (this.isConnected) {
        rs(null);
      }

      setTimeout(() => {
        if (this.isConnected) {
          rs(null);
        }
      }, 200);
    });
  }

  send(type: string, data: ISafeAny) {
    this.waitConnected().then(() => {
      this.ws.send(
        JSON.stringify({
          type,
          data
        })
      );
    });
  }

  start(appName: IAppName) {
    return new Promise((resolve) => {
      this.send(EAppDevSocketType.StartApp, appName);
      const subs = this.startedApp$.subscribe((x) => {
        if (x === appName) {
          subs.unsubscribe();
          resolve(null);
        }
      });
    });
  }

  inactive(appName: IAppName) {
    this.send(EAppDevSocketType.AppInactive, appName);
  }

  active(appName: IAppName) {
    this.send(EAppDevSocketType.AppActive, appName);
  }

  close(appName: IAppName) {
    return new Promise((resolve) => {
      this.send(EAppDevSocketType.CloseApp, appName);
      const subs = this.closedApp$.subscribe((x) => {
        if (x === appName) {
          subs.unsubscribe();
          resolve(null);
        }
      });
    });
  }

  getRunningApps(): Promise<IAppName[]> {
    return new Promise((resolve) => {
      this.send(EAppDevSocketType.RunningApps, null);
      const subs = fromEvent<MessageEvent>(this.ws, 'message').subscribe((ev) => {
        const rawData = JSON.parse(ev.data);
        const { type, data } = rawData;
        if (type === EAppDevSocketType.RunningApps) {
          subs.unsubscribe();
          resolve(data);
        }
      });
    });
  }
}
