addEventListener('install', event => {
  event.waitUntil(
    caches.open('talk2gpt').then(db => db.addAll([
      './',
      './js/$.js',
      './js/incremental-text.js',
      './js/index.js',
      './js/listen.js',
      './js/openai.js',
      './js/storage.js',
      './js/voices.js',
      './css/index.css',
      './css/settings.css'
    ]))
  );
});

addEventListener('fetch', event => {
  const {request} = event;
  event.respondWith(
    caches.open('talk2gpt').then(db => db.match(request).then(response => {
      const fallback = fetch(request).then(
        response => {
          if(response.ok && request.method === 'GET')
            db.put(request, response.clone());
          return response;
        },
        () => new Response('Not Found', {
          status: 404,
          type: 'plain/text'
        })
      );
      return response || fallback;
    }))
  );
});
