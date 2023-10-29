import path, { resolve } from 'path';

export namespace pathUtils {
  export const workspaceRoot = resolve(__dirname, '..', '..');
  export const tailwindcss = resolveWorkspaceRoot('scripts', 'tailwind.config.ts');

  export function getAppProjectDir(name: IAppName) {
    return resolveWorkspaceRoot(name.replace('@', ''));
  }

  export function getMicroModulesDir() {
    return resolveWorkspaceRoot('micro/modules');
  }

  export function resolveWorkspaceRoot(...paths: string[]) {
    return path.resolve(workspaceRoot, ...paths);
  }

  export function getPortsJsonPath() {
    return resolveWorkspaceRoot('ports.json');
  }
}
