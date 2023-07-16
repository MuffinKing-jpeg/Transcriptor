import {createFFmpeg, fetchFile} from '@ffmpeg/ffmpeg';
import chalk from 'chalk';
import path from 'path';
import {config} from './config.js';
import {writeFile} from 'fs/promises';

export function transcoder(list: string[]): Promise<string[]> {
  return new Promise((resolve, reject) => {
    console.log('Loading ffmpeg...')
    const ffmpeg = createFFmpeg({log: false})
    ffmpeg
      .load()
      .then(async () => {
        console.log(chalk.green('FFmpeg loaded.'))

        const filesToSave: Promise<void>[] = []
        const outputFiles: string[] = []

        for (let i = 0; i < list.length; i++) {
          console.log('Transcoding:', chalk.magenta(list[i]))
          const fileName = path.resolve(`${config.inputFolder}/${list[i]}`)
          const outputPath = path.resolve(`${config.audioFolder}/${list[i]}.mp3`)

          ffmpeg.FS('writeFile', list[i], await fetchFile(fileName));
          await ffmpeg.run('-i', list[i], '-c:a', 'libmp3lame', '-vn', '-b:a', '256k', list[i] + '.mp3')
          filesToSave.push(writeFile(outputPath, ffmpeg.FS('readFile', list[i] + '.mp3')))

          outputFiles.push(`${list[i]}.mp3`)
        }

        Promise.all(filesToSave).then(() => {
          resolve(outputFiles)
        }).catch(err => {
          console.error(chalk.black.bgRed(err.message))
          reject(err.message)
        })
      })
      .catch(err => {
        console.error(chalk.bgRed.black('Failed to load FFmpeg:', chalk.bgRed.black(err.message)))
      })
  })
}
