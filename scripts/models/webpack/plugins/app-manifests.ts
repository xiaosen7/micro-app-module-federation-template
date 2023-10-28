/* eslint-disable prettier/prettier */

import { writeFile } from 'fs/promises';
import { resolve, join } from 'path';

import { readProjects } from '@pnpm/filter-workspace-packages';
import { green } from 'chalk';
import { pathUtils } from 'scripts/utils/paths';
import { dedent } from 'ts-dedent';

import type { WebpackPluginInstance } from 'webpack';

export interface IAppManifestsOptions {}

export class AppManifestsPlugin implements WebpackPluginInstance {
  async apply() {
    const { selectedProjectsGraph } = await readProjects(pathUtils.workspaceRoot, [
      {
        namePattern: '@micro/*'
      }
    ]);
    const selectedProjects = Object.values(selectedProjectsGraph)
      .filter((x) => x.package.manifest.name !== '@micro/modules')
      .map((x) => x.package);

    const modulePath = resolve('src/app-manifests.ts');
    const code = dedent`
    /* eslint-disable prettier/prettier */
    // Do not modify this file, auto generated by ${AppManifestsPlugin.name}.
    import type { ProjectManifest } from '@pnpm/types';

    ${selectedProjects.map((proj, i) => `import manifest${i} from '${join(proj.dir, 'package.json')}';`).join('\n')}

    export const appManifests = {
      ${selectedProjects
        .map((proj, i) => {
          return `'${proj.manifest.name!}': manifest${i}`;
        })
        .join(',\n')}
    } satisfies Record<IMicroAppName, ProjectManifest>;
    `;
    await writeFile(modulePath, code);
    console.log(green(`Successfully add module ${modulePath}.`));
  }
}