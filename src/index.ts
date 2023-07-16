import chalk from 'chalk'
import {importer} from './importer/importer.js';
import {transcoder} from './transcoder/transcoder.js';
import {transcriptor} from './transcriptor/transcriptor.js';

console.log(chalk.green('Starting'))
importer()
  .then((list) => {
    return transcoder(list)
  })
  .then((list) => {
    return transcriptor(list)
  })
  .then(() => process.exit())
  .catch(err => {
    console.error(chalk.bgRed.black('Oops, something broke (╯°□°）╯︵ ┻━┻'))
    console.error(chalk.bgRed.black('More info:', err))
  })
