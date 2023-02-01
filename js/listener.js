import {$} from './$.js';
import listen from './listen.js';

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

  // listen to something
  listen().then(
    transcript => {
      clearInterval(i);
      log('You said: ' + (transcript || 'nothing'));
      currentTarget.disabled = false;
    },
    console.error
  );
});
