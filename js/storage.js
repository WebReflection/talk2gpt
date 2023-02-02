/*! (c) Andrea Giammarchi */

const {
  JSON,
  localStorage,
  sessionStorage,
} = globalThis;

const {parse, stringify} = JSON;

const JSONStorage = storage => ({
  get: key => parse(storage.getItem(key) || 'null'),
  set: (key, value) => storage.setItem(key, stringify(value))
});

export const local = JSONStorage(localStorage);
export const session = JSONStorage(sessionStorage);
