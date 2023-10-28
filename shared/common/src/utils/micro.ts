import { omit } from 'modules/lodash-es';
import ports from 'root/ports.json';

import { envUtils } from '.';

export namespace MicroUtils {
  export function getAppUrl(appName: IAppName) {
    let url: string;
    if (envUtils.isDev()) {
      url = `http://localhost:${getAppPort(appName)}`;
    } else {
      url = `${location.origin}/${appName.replace('@', '')}/`;
    }

    return url;
  }

  export function openMicroApp(appName: IAppName) {
    window.open(getAppUrl(appName));
  }

  export function getAppPort(appName: IAppName) {
    return ports[appName];
  }

  export function getAppPorts(): Record<IAppName, number> {
    return ports;
  }

  export function getMicroAppPorts(): Record<IMicroAppName, number> {
    return omit(ports, ['@apps/main', '@micro/modules']);
  }

  /**
   * 该函数用于跨应用之间的跳转，也可以用于应用内的路由跳转
   * @param url
   */
  export function navigate(url: string | URL | null | undefined) {
    window.history.pushState(null, '', url);
    window.dispatchEvent(new PopStateEvent('popstate', { state: null }));
  }
}
