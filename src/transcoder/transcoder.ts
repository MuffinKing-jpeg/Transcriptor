import {createFFmpeg, fetchFile} from '@ffmpeg/ffmpeg';
import chalk from 'chalk';
import path from 'path';
import {Config} from '../config.js';
import {writeFile} from 'fs/promises';

export function transcoder(list: string[]): Promise<string[]> {
  return new Promise((resolve, reject) => {
    console.log('Loading ffmpeg...')
    const ffmpeg = createFFmpeg({log: Config.debug})
    ffmpeg
      .load()
      .then(async () => {
        console.log(chalk.green('FFmpeg loaded.'))

        const filesToSave: Promise<void>[] = []
        const outputFiles: string[] = []

        for (let i = 0; i < list.length; i++) {
          console.log('Transcoding:', chalk.magenta(list[i]))
          const dateSuffix = '.' + Date.now()
          const fileName = path.resolve(`${Config.inputFolder}/${list[i]}`)
          const outputPath = path.resolve(`${Config.audioFolder}/${list[i] + dateSuffix}.opus`)
          try {
            ffmpeg.FS('writeFile', list[i], await fetchFile(fileName));
            await ffmpeg.run('-i', list[i], '-c:a', 'libopus', '-b:a', '128k', list[i] + dateSuffix + '.opus')
            filesToSave.push(writeFile(outputPath, ffmpeg.FS('readFile', list[i] + dateSuffix + '.opus')))
            outputFiles.push(`${list[i] + dateSuffix}.opus`)
            console.log(chalk.green('Transcoded to:'), chalk.magenta(outputFiles[i]))
          } catch (e) {
            console.error(chalk.bgRed.black('Transcoding of'), chalk.magenta(list[i]), chalk.bgRed.black('failed'))
          }
        }

        Promise.all(filesToSave).then(() => {
          resolve(outputFiles)
        }).catch(err => {
          console.error(chalk.black.bgRed(err.message))
          reject(err)
        })
      })
      .catch(err => {
        console.error(chalk.bgRed.black('Failed to load FFmpeg:', chalk.bgRed.black(err.message)))
        reject(err)
      })
  })
}
