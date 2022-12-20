#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { commands } from './cmds/index.mjs';

yargs(hideBin(process.argv))
  .scriptName('dapi')
  .command(commands)
  .argv;

