
var tmdbApi = {
  root: "https://api.themoviedb.org/3",
  token: "24758e2d6d872edf774b8e3777b4d0de",

  posterUrl: function(movie) {
    var baseImageUrl =
    "http://image.tmdb.org/t/p/w300/";
    return baseImageUrl + movie.poster_path;
  }
};

function initMap() {
  var location = {lat: 41.850033, lng: -87.6500523};
  var mapProperties = {
    zoom: 4,
    center: location
  }
  var map = new google.maps.Map(document.getElementById('map'), mapProperties);
}

$("#search").submit(function(evt) {
  evt.preventDefault();
  var searchTerm = $("#search-term").val();
  
})
