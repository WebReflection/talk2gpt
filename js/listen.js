/*! (c) Andrea Giammarchi - ISC */

let {Object, Promise, SpeechRecognition, clearTimeout, setTimeout} = globalThis;
if (!SpeechRecognition)
  SpeechRecognition = webkitSpeechRecognition;

const {assign} = Object;
const interimResults = {interimResults: true};
const once = {once: true};

export default (options = void 0) => new Promise((resolve, reject) => {
  let t = 0, ended = false;
  const stop = event => {
    clearTimeout(t);
    ended = true;
    sr.stop();
    if (event) {
      if (event.type === 'nomatch' || event.error === 'no-speech')
        resolve('');
      else
        reject(event.type === 'end' ? {error: 'unable to understand'} : event);
    }
  };
  const result = ({results}) => {
    stop();
    for (const result of results) {
      if (result.isFinal) {
        for (const {transcript} of result) {
          resolve(transcript);
          return;
        }
      }
    }
  };
  const sr = assign(new SpeechRecognition, options, interimResults);
  sr.addEventListener('error', stop, once);
  sr.addEventListener('nomatch', stop, once);
  sr.addEventListener('end', stop, once);
  sr.addEventListener('audioend', () => stop(), once);
  sr.addEventListener('result', event => {
    if (ended)
      result(event);
    else {
      clearTimeout(t);
      t = setTimeout(result, 750, event);
    }
  });
  sr.start();
});
