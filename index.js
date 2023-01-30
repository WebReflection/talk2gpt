/*! (C) Andrea Giammarchi */

// trap once all public APIs to avoid possible extensions overrides
(({
  JSON,
  SpeechRecognition,
  SpeechSynthesisUtterance,
  cancelAnimationFrame,
  fetch,
  localStorage,
  prompt,
  requestAnimationFrame,
  sessionStorage,
  speechSynthesis,
  webkitSpeechRecognition
}) => {
  if (!SpeechRecognition)
    SpeechRecognition = webkitSpeechRecognition;

  if (!speechSynthesis)
    speechSynthesis = {
      cancel: Object,
      speak: Object,
      addEventListener: Object,
      getVoices: () => []
    };

  const {parse, stringify} = JSON;

  const jsonStorage = storage => {
    const {getItem, setItem} = storage;
    const get = getItem.bind(storage);
    const set = setItem.bind(storage);
    return {
      get: key => parse(get(key) || 'null'),
      set: (key, value) => {
        set(key, stringify(value));
      }
    };
  };

  const update = ({type, currentTarget}) => {
    const value = Math.min(currentTarget.max, Math.max(currentTarget.min, currentTarget.value));
    currentTarget.value = value;
    currentTarget.nextElementSibling.textContent = value;
    if (type === 'change')
      local.set(currentTarget.name, value);
  };

  const setOption = name => {
    if (local.get(name) ==  null)
      local.set(name, +config.firstElementChild[name].value);
    config.firstElementChild[name].value = local.get(name);
    update({type: '', currentTarget: config.firstElementChild[name]});
  };

  const local = jsonStorage(localStorage);
  const session = jsonStorage(sessionStorage);

  addEventListener(
    'DOMContentLoaded',
    () => {
      for (const input of config.querySelectorAll('input')) {
        input.addEventListener('change', update);
        input.addEventListener('pointermove', update);
      }

      setOption('volume');
      setOption('temperature');
      setOption('max_tokens');

      // make OpenAI secret a scoped reference to bypass lazy observers
      let Authorization = session.get('Authorization');
      // wait for voices to be populated (ugliest API ever)
      new Promise($ => {
        speechSynthesis.addEventListener(
          'voiceschanged',
          () => { $(speechSynthesis.getVoices()) },
          {once: true}
        );
        const voices = speechSynthesis.getVoices();
        if (voices.length) $(voices);
        setTimeout($, 3000, []);
      }).then(voices => {
        if (voices.length) {
          let hasDefault = false;
          const form = document.querySelector('form');
          const select = document.createElement('select');
          select.id = 'voice';
          const label = document.createElement('label');
          label.appendChild(document.createElement('span')).textContent = 'voice';
          for (const entry of voices) {
            if (entry.lang === navigator.language) {
              const option = document.createElement('option');
              option.value = entry.name;
              option.textContent = entry.name.replace(/\(.+?\)\s*\+/, '').slice(0, 26);
              if (entry.default)
                option.selected = hasDefault = true;
              select.append(option);
            }
          }
          if (!hasDefault)
            select.firstChild.selected = true;
          form.insertBefore(label, form.firstChild).append(select);
        }
        talk.firstElementChild.disabled = false;
        talk.firstElementChild.focus();
        talk.firstElementChild.addEventListener('click', {
          rAF: 0,
          recognition: null,
          show(answer) {
            this.text(answer);
            const utterThis = new SpeechSynthesisUtterance(answer);
            utterThis.volume = local.get('volume');
            utterThis.lang = navigator.language;
            // utterThis.rate = 1;
            // utterThis.pitch = 1.7;
            for (const entry of voices) {
              if (entry.name === voice.value) {
                utterThis.voice = entry;
                break;
              }
            }
            speechSynthesis.cancel();
            speechSynthesis.speak(utterThis);
          },
          text(value) {
            const chars = [...value];
            let i = 0;
            chat.firstElementChild.textContent = '';
            const show = () => {
              if (i < chars.length) {
                chat.firstElementChild.textContent += chars[i++];
                this.rAF = requestAnimationFrame(show);
              }
            };
            cancelAnimationFrame(this.rAF);
            show();
          },
          handleEvent({currentTarget: button}) {
            this.text('. '.repeat(42));
            if (!this.recognition) {
              if (!Authorization) {
                while (!Authorization)
                  Authorization = prompt('What is your OpenAI API key?');
                session.set('Authorization', Authorization = 'Bearer ' + Authorization);
              }
              this.recognition = new SpeechRecognition;
              this.recognition.interimResults = true;
              // this actually doesn't work on iOS
              // this.recognition.addEventListener('audioend', () => {
              //   this.recognition.stop();
              //   button.disabled = false;
              // });
              this.recognition.addEventListener('error', () => {
                this.recognition.abort();
                button.disabled = false;
                this.show('Something wrong just happened ...');
              });
              this.recognition.addEventListener('nomatch', () => {
                this.recognition.abort();
                button.disabled = false;
                this.show(`I didn't get that ... can you please repeat?`);
              });
              let t = 0;
              this.recognition.addEventListener('result', ({results}) => {
                clearTimeout(t);
                t = setTimeout(() => {
                  for (const result of results) {
                    this.recognition.stop();
                    if (result.isFinal) {
                      for (const {transcript} of result) {
                        this.text('.'.repeat(42));
                        fetch('https://api.openai.com/v1/completions', {
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization
                          },
                          method: 'POST',
                          body: stringify({
                            model: "text-davinci-003",
                            prompt: transcript,
                            temperature: local.get('temperature'),
                            max_tokens: local.get('max_tokens')
                          })
                        })
                        .then(res => res.json())
                        .then(result => {
                          button.disabled = false;
                          button.focus();
                          if (result.error)
                            this.show(result.error.message);
                          else {
                            console.info(transcript, {
                              temperature: local.get('temperature'),
                              max_tokens: local.get('max_tokens'),
                              usage: result.usage
                            });
                            for (const choice of result.choices) {
                              this.show(choice.text.trim());
                              break;
                            }
                          }
                        });
                        return;
                      }
                    }
                  }
                }, 750);
              });
            }
            button.disabled = true;
            this.show('huh?');
            this.recognition.start();
          }
        });
      });
    },
    {once: true}
  );
})(globalThis);
