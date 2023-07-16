import {transcriptor} from './transcriptor.js';
import {readdir} from 'fs/promises';
import {Config} from '../config.js';

readdir(Config.audioFolder)
  .then(list => {
    transcriptor(list)
      .then(() => process.exit())
  })

