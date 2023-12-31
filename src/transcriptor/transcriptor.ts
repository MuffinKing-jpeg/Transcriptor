import {SpeechClient} from '@google-cloud/speech'
import {Config} from '../config.js';
import {google} from '@google-cloud/speech/build/protos/protos.js';
import chalk from 'chalk';
import {writeFile} from 'fs/promises';
import {Storage} from '@google-cloud/storage';
import IRecognizeRequest = google.cloud.speech.v1.IRecognizeRequest;
import IRecognitionConfig = google.cloud.speech.v1.IRecognitionConfig;
import IRecognitionAudio = google.cloud.speech.v1.IRecognitionAudio;
import {text} from 'stream/consumers';

export function transcriptor(list: string[]): Promise<void> {
  return new Promise<void>(async () => {
    const bucketName = 'muffin-transcriptions'
    const client = new SpeechClient();
    const storage = new Storage()
    const bucket = storage.bucket(bucketName)

    const config: IRecognitionConfig = {
      encoding: 'OGG_OPUS',
      languageCode: 'en-GB',
      alternativeLanguageCodes: ['en-US', 'en-AU', 'en-CA'],
      sampleRateHertz: 48000,
      audioChannelCount: 2,
      enableAutomaticPunctuation: true,
      enableSpokenPunctuation: {value: true},

      model: 'latest_long'
    };

    for (let i = 0; i < list.length; i++) {

      bucket.upload(`${Config.audioFolder}/${list[i]}`, {
        destination: `audio-files/${list[i]}`
      }).then(v => {
        const audio: IRecognitionAudio = {
          uri: `gs://${bucketName}/${v[0].name}`
        };
        const request: IRecognizeRequest = {
          config: config,
          audio: audio,
        };
        client.longRunningRecognize(request).then(([response]) => {
          console.log('Starting transcription of', list[i]);
          response.promise().then(([response]) => {
            if (response.results) {
              const transcription = response.results
                .map(result => result.alternatives)
              const transcriptionTXT = response.results
                .map(result => result.alternatives && result.alternatives[0].transcript)
                .join('\n')
              const jsonFileName = list[i] + '.transcription.json'
              const textFileName = list[i] + '.transcription.txt'


             Promise.all([
                writeFile(Config.outputFolder + '/' + jsonFileName, JSON.stringify(transcription, null, 4)),
                writeFile(Config.outputFolder + '/' + textFileName, transcriptionTXT)
              ]).then(()=> {
               console.log(chalk.green('Transcription saved to files:'), chalk.magenta(textFileName),',', chalk.magenta(jsonFileName));
             })
            }
          })

        });
      })
    }
  })
}
