import {mkdir, readdir} from 'fs/promises'
import chalk from 'chalk';
import {Config} from '../config.js'
import {existsSync} from 'fs';

export function importer(): Promise<string[]> {
  console.log('Importing...')
  return new Promise((resolve, reject) => {
    readFolder()
      .then((list) => {
        if (list && list.length > 0) {
          console.log(chalk.green('Found files: '), chalk.magenta(list.toString()))
          resolve(list)
        } else {
          console.error(chalk.bgRed.black('No files found!'))
        }
      })
      .catch(err => {
        reject(err)
      })
  })
}

function readFolder() {
  const foldersList: Promise<void>[] = []

  if (!existsSync(Config.inputFolder)) foldersList.push(mkdir(Config.inputFolder))
  if (!existsSync(Config.outputFolder)) foldersList.push(mkdir(Config.outputFolder))
  if (!existsSync(Config.audioFolder)) foldersList.push(mkdir(Config.audioFolder))

  Promise.all(foldersList).then(arr => {
    if (arr.length > 0) console.log(chalk.green('\nFolders created.'))
  })
    .catch((err) => {
      console.error(err.message)
    })
  return readdir(Config.inputFolder).then(list => {
    return list
  }).catch(err => {
    console.error(chalk.red(err.message))

  })
}


