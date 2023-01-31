/*! (c) Andrea Giammarchi */

export default (timeout = 3000) => new Promise($ => {
  // must be assigned before trying to access voices
  speechSynthesis.addEventListener(
    'voiceschanged',
    () => { $(speechSynthesis.getVoices()) },
    {once: true}
  );
  // kinda trigger the voices recognition
  const voices = speechSynthesis.getVoices();
  // if already populated, just resolve with it
  if (voices.length) $(voices);
  setTimeout($, timeout, []);
});
