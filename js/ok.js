import {$} from './$.js';
import listen from './listen.js';

// create a div and show some text
const log = text => {
  const div = document.createElement('div');
  div.textContent = text;
  $('#content').appendChild(div);
};

// say something in the default language
const say = text => {
  const ssu = new SpeechSynthesisUtterance(text);
  // cancel any previous text before starting this one
  speechSynthesis.cancel();
  speechSynthesis.speak(ssu);
};

// activate the listening
$('#mic').on('click', ({currentTarget}) => {
  currentTarget.disabled = true;
  const check = transcript => {
    switch (transcript.toLowerCase()) {
      case 'stop listening':
        currentTarget.disabled = false;
        say('just stopped');
        log('Just stopped 👍');
        break;
      case 'ok web':
      case 'okay web':
        say('I am ready');
        log('I am ready 🤖');
      default:
        console.log(transcript);
        listen().then(check);
        break;
    }
  };
  // grant SpeechSynthesisUtterance usage
  say('');
  // listen and check
  listen().then(check);
});
