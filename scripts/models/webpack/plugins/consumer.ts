import fsx from 'fs-extra';
import { container } from 'webpack';

import { pathUtils } from '../../../utils/paths';

export class ModuleFederationConsumerPlugin extends container.ModuleFederationPlugin {
  constructor(options: { isDev: boolean }) {
    const ports = fsx.readJSONSync(pathUtils.getPortsJsonPath());
    super({
      remotes: {
        modules: options.isDev
          ? `modules@http://localhost:${ports['@micro/modules' as keyof typeof ports]}/remoteEntry.js`
          : `modules@/micro/modules/remoteEntry.js`
      }
    });
  }
}
