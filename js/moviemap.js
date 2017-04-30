

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
  var location = {lat: 28.028290, lng: -82.006587};
  var mapProperties = {
    zoom: 3,
    center: location
  }
  var map = new google.maps.Map(document.getElementById('map'), mapProperties);
}
