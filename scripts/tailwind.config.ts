import path from 'path';

import { pathUtils } from './utils/paths';

import type { Config } from 'tailwindcss';

export default {
  content: [
    path.join(pathUtils.workspaceRoot, './micro/*/src/**/*.{html,js,jsx,ts,tsx}'),
    path.join(pathUtils.workspaceRoot, './apps/*/src/**/*.{html,js,jsx,ts,tsx}')
  ],
  theme: {
    extend: {}
  },
  plugins: [],
  corePlugins: {
    preflight: false
  }
} satisfies Config;
