import {$} from './$.js';

// normalize SpeechRecognition
let {SpeechRecognition} = globalThis;
if (!SpeechRecognition)
  SpeechRecognition = webkitSpeechRecognition;

// create a div and show some text
const log = text => {
  const div = document.createElement('div');
  div.textContent = text;
  $('#content').appendChild(div);
};

// activate the listening
$('#mic').on('click', ({currentTarget}) => {
  // avoid clicks while listenings
  currentTarget.disabled = true;

  // log passed time
  log(0);
  const time = new Date;
  const i = setInterval(node => {
    node.textContent = ((new Date - time) / 1000).toFixed(1);
  }, 100, $('#content').lastChild);

  // start listening with interimResults
  const sr = new SpeechRecognition;
  sr.interimResults = true;
  let t = 0, ended = false;
  $(sr)
    // works both on Chrome and Safari
    .on('result', event => {
      // prevent multiple showResult calls
      clearTimeout(t);
      // but if audioend fired already
      if (ended)
        // show results right away (if any final is present)
        showResult(event);
      // otherwise wait 750ms (or more, or less)
      else
        t = setTimeout(showResult, 750, event);
    })
    // works on Chrome, maybe on Safari too
    .on('audioend', () => {
      ended = true;
    })
    .start()
  ;

  // stop listening (collects the final result)
  // and show the result. This could get called
  // multiple times.
  function showResult({results}) {
    ended = true; // speed up iOS
    sr.stop();
    for (const result of results) {
      // consider only the final result
      if (result.isFinal) {
        // loop the first alternative returned
        for (const {transcript} of result) {
          // clean up and show result + enable button
          clearInterval(i);
          console.log(result);
          log('You said: ' + transcript);
          currentTarget.disabled = false;
          return;
        }
      }
    }
  }
});
