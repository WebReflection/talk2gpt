/*! (c) Andrea Giammarchi */

const {assign} = Object;
const interimResults = {interimResults: true};
const once = {once: true};

let {SpeechRecognition} = globalThis;
if (!SpeechRecognition)
  SpeechRecognition = webkitSpeechRecognition;

export default (options = void 0) => new Promise((resolve, reject) => {
  let t = 0, ended = false;
  const stop = event => {
    if (event) reject(event);
    clearTimeout(t);
    ended = true;
    sr.stop();
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
