'use strict';

// https://www.openbrewerydb.org/#documentation
const searchURL = 'https://api.openbrewerydb.org/breweries?by_city=';

/* The "watchForm" function will be responsible for when users click the "submit" button on the landing page. Once the event listener on the form has been triggered, it passes the value entered by the user to the “getBreweries" function */
function watchForm() {
  $('#input-form').submit(event => {
    event.preventDefault();
    const searchCity = $('#js-search-city').val();
    getBreweries(searchCity);
  });
}

/* The "watchForm" function will take the value passed from the “watchForm" and combine it with the “searchURL" const to create a url to be used to fetch a Json response from the open brewery API. If a valid Json response is fetched, it will pass that response to both the “displayResults" & “renderMap" functions. If an invalid response or no response is fetched, an error will be displayed in the DOM. */
function getBreweries(city) {
  const url = searchURL + city;

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
        $('#js-error-message').html("Sorry, we could not find any results for that city");
      }
       displayResults(responseJson);
       renderMap(responseJson);
    })
    .catch(err => {
      console.log(err.message);
      $('#js-error-message').text(`Something went wrong! Please try again`);
    });
}

/* The "displayResults" function will take the Json passed from the “watchForm" and render the results list in the DOM as well as unhide and scroll to the results section. */
function displayResults(responseJson) {
  console.log(responseJson);
  $('#results-list').empty();

  for (let i = 0; i < responseJson.length; i++){
    $('#results-list').append(
      `
        <li>
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
};

/* The "renderMap" function will take the Json passed from the “watchForm" and render the latitude and longitude of each results on the map. */
function renderMap(responseJson) {
  console.log("rendering map");
  let firstResult = responseJson[0];
  var myLatlng = new google.maps.LatLng(firstResult.latitude, firstResult.longitude);
  
  var mapOptions = {
    zoom: 11,
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