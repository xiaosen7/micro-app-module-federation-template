import { program } from 'commander';

import { BuildCommand } from './models/commands/build';
import { DevCommand } from './models/commands/dev';
import { MiCommand } from './models/commands/mi';
import { log } from './utils/log';

import type { Command } from './models/commands/command';

function errorHandler(error: Error) {
  log.error(error.message);
  if (error.stack) {
    log.error(error.stack);
  }

  process.exit(1);
}
process.on('uncaughtException', errorHandler);
process.on('unhandledRejection', errorHandler);

program.command('mi <packages...>').description('install modules').action(createAction(MiCommand));
program.command('build').action(createAction(BuildCommand));
program.command('dev').action(createAction(DevCommand));

program.showHelpAfterError();
program.usage('<command> [options]').parse(process.argv);

function createAction(CommandConstructor: new (...args: ISafeAny[]) => Command) {
  return async (...args: ISafeAny[]) => {
    await new CommandConstructor(...args).execute();
  };
}
