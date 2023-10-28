import ports from 'root/ports.json';
import { container } from 'webpack';

export class ModuleFederationConsumerPlugin extends container.ModuleFederationPlugin {
  constructor(options: { isDev: boolean }) {
    super({
      remotes: {
        modules: options.isDev ? `modules@http://localhost:${ports['@micro/modules']}/remoteEntry.js` : `modules@/micro/modules/remoteEntry.js`
      }
    });
  }
}
