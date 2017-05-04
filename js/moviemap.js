
// MODEL & HELPERS

var model = {
  titleResults: [],
};

var posterUrl = function(movie) {
  var baseImageUrl =
  "http://image.tmdb.org/t/p/w300/";
  return baseImageUrl + movie.poster_path;
};

function fetchMovieInfo(title) {

  $.ajax({
    url: "https://api.themoviedb.org/3/search/movie",
    data: {
      api_key: "24758e2d6d872edf774b8e3777b4d0de",
      query: title
    },
    success: function(response) {
      model.titleResults = response.results;
      console.log(model.titleResults);
    }
  })
}


function goToCoordinates(location) {

  $.ajax({
    url: "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyBH1GdmBFyhL3U_AqZLzMk_iQl5NXuU-Mc&address=" + location,
    success: function(response) {
      // console.log(response.results[0].geometry.location);
      var isRealLocation = response.results.length > 0;
      if (!isRealLocation) {
        // TODO DISPLAY ERROR
      } else {
        var coordinates = response.results[0].geometry.location;
        console.log(coordinates.lat);
        currentLocation = {
          lat: coordinates.lat,
          lng: coordinates.lng};
        changeCenter(currentLocation);
      }
    },
    error: function(err) {
      console.log(err);
    }
  });
}

function addMarker(latLng, map) {
  var marker = new google.maps.Marker({
    position: latLng,
    map: map
  });
}

function changeCenter(center) {
  map.setCenter(center);
  map.setZoom(11);
  // TODO set zoom based on location Info
  // low for countries, 11 for cities, high for street level
}


// Map

var map;
var marker;
var zoom = 4
var currentLocation = {
  lat: 41.850033,
  lng: -87.6500523
};

function initMap() {
  var mapProperties = {
    zoom: zoom,
    center: currentLocation
  }
  map = new google.maps.Map(document.getElementById('map'), mapProperties);
}


// DOM Event Handlers

$("#search-param").change(function () {
  $("#search-term").attr("placeholder", ($(this).val() == "title-search") ? "Enter movie title" : "Enter location")
})

$("#search").submit(function(evt) {
  evt.preventDefault();
  var searchTerm = $("#search-term").val();
  if ($("#search-param").val() == "title-search") {
    // TODO write this function
    displayTitleLocations(searchTerm);
    // TODO search myAPIfilms with searchTerm as title

    console.log(searchTerm + " is a title");
  } else if ($("#search-param").val() == "location-search") {
    goToCoordinates(searchTerm);



    // TODO call myAPIfilms with searchTerm as location
    console.log(searchTerm + " is a location");
  } else {
    // TODO display error "must choose search parameter"
    console.log("error");
  }
})
