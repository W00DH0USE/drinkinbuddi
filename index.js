'use strict';

// https://www.openbrewerydb.org/#documentation
const searchURL = 'https://api.openbrewerydb.org/breweries?by_city=';

/* Handles when users submit a search */
function watchForm() {
  $('#input-form').submit(event => {
    event.preventDefault();
    const searchCity = $('#js-search-city').val();
    const searchState = $('#js-search-state').val();
    getBreweries(searchCity, searchState);
  });
}

/* Handles the submitted search inputs to get API data and call next functions */
function getBreweries(city, state) {
  const url = searchURL + city + "&by_state=" + state;

  console.log(url);

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => {
      if(!responseJson.length){
        $('#js-error-message').text("Sorry, we could not find any results for that city");
      }
       displayResults(responseJson);
       getMapGeometry(responseJson);
    })
    .catch(err => {
      console.log(err.message);
      $('#js-error-message').text(`Sorry, we could not find any results! Please try again`);
      $('main').addClass('hidden');
      $('footer').addClass('hidden');
    });
}

/* Handles the Json and renders the information in the html */
function displayResults(responseJson) {
  console.log(responseJson);
  $('#results-list').empty();

  for (let i = 0; i < responseJson.length; i++){
    $('#results-list').append(
      `
        <li role="listitem">
            <div class="results-box">
            <h3 class="result-name"><span class="result-name-style">${responseJson[i].name}</span></h3>
            <p class="result-title">address</p>
            <p class="result-address">${responseJson[i].street}, ${responseJson[i].city}, ${responseJson[i].state}, ${responseJson[i].postal_code}, ${responseJson[i].country}</p>
            <p class="result-title">phone number</p>
            <p class="result-phone">${responseJson[i].phone.toString().replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}</p>
            <hr>
            <p class="result-website"><a class="result-website-link" href="${responseJson[i].website_url}">Visit Website</a></p>
            </div>
        </li>
      `
    )};

  $('main').removeClass('hidden');
  $('footer').removeClass('hidden');
  $('html, body').animate({ scrollTop: $('main').offset().top});
  document.getElementById("input-form").reset();
  $('#js-error-message').text(" ");
};

/* Handles the Json and fetches the coordinates for the map */
function getMapGeometry(responseJson) {

  const latLongUrl = "https://maps.googleapis.com/maps/api/geocode/json?address=" + responseJson[0].postal_code + "&key=AIzaSyDeuqPkmVtvA3OPa9gnRtVpoOMb_p1FtoU";

  fetch(latLongUrl)
     .then(latLongResponse => {
       if (latLongResponse.ok) {
         return latLongResponse.json();
       }
       throw new Error(latLongResponse.statusText);
     })
     .then(latLongResponseJson => {
      if(!latLongResponseJson.length){
        renderMap(latLongResponseJson, responseJson);
      }
    })
}

/* Handles the map api the renders the results */
function renderMap(latLongResponseJson, responseJson) {

  var myLatlng = new google.maps.LatLng(latLongResponseJson.results[0].geometry.location.lat, latLongResponseJson.results[0].geometry.location.lng);

  var mapOptions = {
    zoom: 9,
    center: myLatlng
  }

  var map = new google.maps.Map(document.getElementById("map-container"), mapOptions);
  responseJson.forEach(loc => {
    var coordinates = new google.maps.LatLng(loc.latitude, loc.longitude);
    var marker = new google.maps.Marker({
    position: coordinates,
    title: loc.name
    });
  
    marker.setMap(map);
  });
}

$(watchForm);