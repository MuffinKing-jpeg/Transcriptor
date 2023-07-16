import {mkdir, readdir} from 'fs/promises'
import chalk from 'chalk';
import {config} from './config.js'
import {existsSync, rmSync} from 'fs';

export function importer(): Promise<string[]> {
  console.log(chalk.green('Importing...'))
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
  })
}

function readFolder() {

  rmSync(config.audioFolder, {recursive: true})
  const foldersList: Promise<void>[] = []

  if (!existsSync(config.inputFolder)) foldersList.push(mkdir(config.inputFolder))
  if (!existsSync(config.outputFolder)) foldersList.push(mkdir(config.outputFolder))
  if (!existsSync(config.audioFolder)) foldersList.push(mkdir(config.audioFolder))
  Promise.all(foldersList).then(() => {
    console.log(chalk.green('\nFolders created.'))
  })
    .catch((err) => {
      console.error(err.message)
    })
  return readdir(config.inputFolder).then(list => {
    return list
  }).catch(err => {
    console.error(chalk.red(err.message))

  })
}


