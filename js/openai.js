const API = 'https://api.openai.com/v1/';

const {JSON, fetch} = globalThis;

const {stringify} = JSON;

export default class OpenAI {
  #headers = null;
  #models = null;
  constructor(bearer, options) {
    this.#headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + bearer
    };
    this.options = options;
  }
  get models() {
    return this.#models || (this.#models = fetch(API + 'models', {
      headers: this.#headers,
      method: 'GET'
    }).then(res => res.json()));
  }
  complete(transcript) {
    return fetch(API + 'completions', {
      headers: this.#headers,
      method: 'POST',
      body: stringify({
        ...this.options,
        prompt: transcript
      })
    }).then(res => res.json());
  }
}
