import chalk from 'chalk'
import {importer} from '../importer/importer.js';
import {transcoder} from './transcoder.js';

console.log(chalk.green('Starting transcoder'))
importer()
  .then((list) => {
    return transcoder(list)
  })
  .then(() => {
    console.log(chalk.green('Transcoding completed'))
    process.exit()
  })
  .catch(err => {
    console.error(chalk.bgRed.black('Oops, something broke (╯°□°）╯︵ ┻━┻'))
    console.error(chalk.bgRed.black('More info:', err))
  })
