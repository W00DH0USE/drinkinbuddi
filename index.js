'use strict';

// https://www.openbrewerydb.org/#documentation
const searchURL = 'https://api.openbrewerydb.org/breweries?by_city=';

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

function watchForm() {
  $('#input-form').submit(event => {
    event.preventDefault();
    const searchCity = $('#js-search-city').val();
    getBreweries(searchCity);
  });
}

$(watchForm);