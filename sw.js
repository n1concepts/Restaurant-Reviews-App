"use strict";
// define our cache name to easily find and change it later
const staticCacheName = 'restaurant-reviews-v1';

// define an array of assets to cache so that we can easily locate and change later if needed
const urlsToCache = [
  '/',
  '/index.html',
  '/restaurant.html',
  // '/restaurant.html?id=1',
  // '/restaurant.html?id=2',
  // '/restaurant.html?id=3',
  // '/restaurant.html?id=4',
  // '/restaurant.html?id=5',
  // '/restaurant.html?id=6',
  // '/restaurant.html?id=7',
  // '/restaurant.html?id=8',
  // '/restaurant.html?id=9',
  // '/restaurant.html?id=10',
  'css/styles.css',
  'data/restaurants.json',
  'img/1.jpg',
  'img/2.jpg',
  'img/3.jpg',
  'img/4.jpg',
  'img/5.jpg',
  'img/6.jpg',
  'img/7.jpg',
  'img/8.jpg',
  'img/9.jpg',
  'img/10.jpg',
  'js/dbhelper.js',
  'js/main.js',
  'js/restaurant_info.js',
  'js/reg_serviceWorker.js',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
  'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css',
  'https://cdnjs.cloudflare.com/ajax/libs/vanilla-lazyload/8.10.0/lazyload.min.js'
];

// now that we've registered our service worker, we need to do a few things once it installs
// setup an event listener for the install event
self.addEventListener('install', event => {

  // event.waitUntil lets us signel the progress of the install of the serviceWorker

  // we pass it a promise, if the promise resolves, the browser knows the install is complete, if the promise rejects, it knows the install failed and this serviceWorker should be discarded
  event.waitUntil(
    // if we want to load restaurant reviews offline,then we need somewhere to store the html, the css, the images, the webfont and to do this we can utilize the cache/caches API. The caches API gives us a cache object on the global scope. If we want to create or open a cache we can simply call cache.open or caches.open and give the cache the name we want to use (in this case we are using the variable staticCacheName with our desired cache name stored in it - it could be 'my-stuff' or anything else).

    // *** IMPORTANT NOTE: caches.open returns a promise for a cache of that name, AND IF I HAVEN'T OPENED A CACHE BY THAT NAME BEFORE (hmmm...so it will ALSO open a cache by that name if I call it to do stuff with!!!), it creates one and returns it.

    caches.open(staticCacheName).then(cache => {
      // a cache 'box' contains request and response PAIRS from any SECURE origin (https). We can use it to store fonts, scripts, images and anything, from both our own origin as well as anywhere else on the web.

      // We can add cache items using cache.put(request, response); and pass in a request or url and a response or we can use cache.addAll([]); which takes an array of requests or urls, fetches them and puts the request response pairs into the cache, however, when using cache.addALL if any of these fail to cache, then none of them are added.

      // later when we want to get something out of the cache, we can use cache.match(request); passing in a request, or a url. This will return a promise for a matching response if one is found or NULL if no matches are found. Alternatively, caches.match(request) tries to find a match in ANY cache, starting with the OLDEST cache first.
        return cache.addAll(urlsToCache);
      }).catch(err => {
          console.log(err);
      })
  );
});

// Setup an eventlistener for the fetch event because we need to intercept them
self.addEventListener('fetch', event => {
  // console.log(event.request);
  // console.log(event.request.url);
  // console.log(event.request.method);
  // console.log(event.request.headers);
  // console.log(event.request.body);

  event.respondWith(

    // check for a match to the request in the cache
    // {ignorSearch: true} A Boolean that specifies whether to ignore the query string in the URL.  For example, if set to true the ?value=bar part of http://foo.com/?value=bar would be ignored when performing a match. It defaults to false.
    caches.match(event.request, {ignoreSearch: true}).then(response => {

      // if the data already exists in the cache
      if (response) {

        // log to the console that we found a match and what is was we found
        // console.log('Found response in cache:', response);

        // return the data we found in the cache
        return response;
      }

      // if we didn't find a match, then log to the console that this is something new and we need to go get it from the network
      // console.log('No response found in cache. About to fetch from network...');

      // Fetch it from the network
      return fetch(event.request).then(response => {
        // log to the console what we got from the network
        // console.log('Response from network is:', response);

        // since it wasn't found in the cache, lets just add it now
        return caches.open(staticCacheName).then(cache => {
          cache.put(event.request, response.clone());

          // now return what we fetched to the page
          return response;
        });



        // on network error
      }).catch(err => {
        // console.error('Fetching failed:', err);

        throw err;
      });
    })
  );
});







// setup an event listener so we can do some things when the new serviceWorker activates
self.addEventListener('activate', event => {
  event.waitUntil(

    // get all the cacheNames that exist
    caches.keys().then(cacheNames => {
      // we wrap everything in Promise.all() so we wait the complete of all the promises that were mapped before we return anything here. This way we delete everything before signaling the job is done.
      return Promise.all(
        // then we're going to filter those cacheNames because...
        cacheNames.filter(cacheName => {
          // we are only interested in the ones that begin with 'restaurant-reviews-' AND ISN't a name in the list of our staticCacheNames
          return cacheName.startsWith('restaurant-reviews-') && cacheName != staticCacheName;

          // this leaves us with an array of names we don't need anymore that we can map those
        }).map(cacheName => {
          // to promises returned by caches.delete()
          return caches.delete(cacheName);
        })
      );
    })

    // the simpleway, just delete everything else inside of event.waitUntil();
    // caches.delete('restaurant-reviews-v1')
  );
});
