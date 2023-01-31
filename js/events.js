import {$} from './$.js';

// normalize SpeechRecognition
let {SpeechRecognition} = globalThis;
if (!SpeechRecognition)
  SpeechRecognition = webkitSpeechRecognition;

// create a div and show the event name
const logEvent = ({type}) => {
  const div = document.createElement('div');
  div.textContent = type;
  $('#content').appendChild(div);
};

// activate the listening
$('#mic').on('click', ({currentTarget}) => {
  // avoid clicks while listenings
  currentTarget.disabled = true;

  // log passed time
  logEvent({type: 0});
  const time = new Date;
  const i = setInterval(node => {
    node.textContent = ((new Date - time) / 1000).toFixed(1);
  }, 100, $('#content').lastChild);

  // start listening to all events *and*
  // avoid iOS listening forever (it stops in 10 seconds)
  setTimeout(
    $(new SpeechRecognition)
      .on('start', logEvent)
      .on('audiostart', logEvent)
      .on('soundstart', logEvent)
      .on('speechstart', logEvent)
      .on('speechend', logEvent)
      .on('soundend', logEvent)
      .on('audioend', logEvent)
      .on('result', logEvent)
      .on('end', event => {
        logEvent(event);
        // cleanup and stop listening
        clearInterval(i);
        event.currentTarget.stop();
        currentTarget.disabled = false;
      })
      // extra events
      .on('error', logEvent)
      .on('nomatch', logEvent)
      .start()
      // forward the stop
      .stop,
    10000
  );
});
