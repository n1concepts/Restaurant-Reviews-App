"use strict";

let restaurant;
var newMap;

// remove class 'inside' from body element if we detect a mobile phone
// if (window.screen.width < 500 && window.screen.orientation.type === 'portrait-primary') {
//   console.log('we have a mobile in our hands!');
//   document.getElementsByTagName('body')[0].setAttribute('class', '');
// }


/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap();
});

/**
 * Initialize leaflet map
 */
const initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: '<your MAPBOX API KEY HERE>',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}

/* window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
} */

/**
 * Get current restaurant from page URL.
 */
const fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
const fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  // add alt text for Ally
  const altTitleText = `${restaurant.name} in ${restaurant.neighborhood}`;
  image.alt = altTitleText;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {

    // Logic to break Days with Meal Change hours into two lines for styling purposes
    if (window.screen.width < 1024) {
      // for every day
      for (day in restaurant.operating_hours) {
          // if restaurant closes for meal change
          if ((restaurant.operating_hours[day]).includes(',')) {
            //  split the hours at the comma
            let hoursArray = restaurant.operating_hours[day].split(',')
            // set up a linebreak
            let lBreak = "<br>";
            // add the line break at the beginning of each set of hours so it lines up correcty in the DOM
            hoursArray[0] = lBreak.concat(hoursArray[0]);
            hoursArray[1] = lBreak.concat(hoursArray[1]);
            // set the new display for the operating hours
            restaurant.operating_hours[day] = hoursArray;
          }
      }
    }


    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
const fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
const fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
const createReviewHTML = (review) => {
  const li = document.createElement('li');
  // create header div at top of each review (seen in udacity image example)
  const reviewCap = document.createElement('div');
  reviewCap.className = 'review-cap';
  reviewCap.setAttribute('role', 'heading');
  reviewCap.setAttribute('aria-label', `Reviewed by ${review.name} on ${review.date}`);

  const name = document.createElement('p');
  name.className = 'rName';
  name.innerHTML = review.name;
  // append name to review header
  reviewCap.appendChild(name);

  const date = document.createElement('p');
  date.className = 'rDate';
  date.innerHTML = review.date;
  // append date to review header
  reviewCap.appendChild(date);
  // append review header to the list element
  li.appendChild(reviewCap);


  const rating = document.createElement('span');
  rating.className = 'rating';
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
const fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


// settabindex's to -1 in map element
//
// const hideMapTabs = () => {
// document.getElementById('map').setAttribute('tabindex', -1);
// (document.querySelectorAll('.leaflet-marker-pane')[0].childNodes).forEach(function(cur) {
//   cur.setAttribute('tabindex', -1);
// });
// (document.querySelectorAll('.leaflet-control-zoom')[0].childNodes).forEach(function (cur) {
//   cur.setAttribute('tabindex', -1);
// });
// (document.querySelectorAll('.leaflet-control-attribution')[0].childNodes).forEach(function (cur, i) {
//   if (i === 0 || i % 2 === 0) {
//       cur.setAttribute('tabindex', -1);
//   }
//
// })
// };
// window.onload = hideMapTabs;
