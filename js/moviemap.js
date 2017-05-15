
// MODEL & HELPERS

var model = {
  map: document.getElementById("gmap3"),
  windows: [],
  // windows: ["1", "2", "3", "4"],
  currentTitles: [],
  currentID: [],
  currentLocation: "Chicago",
  currentLocations: [],
  addresses: [],
  zoom: 4
};

var tmdbApi = {
  root: "https://api.themoviedb.org/3",
  token: "24758e2d6d872edf774b8e3777b4d0de", //

  posterUrl: function(movie) {
    var baseImageUrl = "http://image.tmdb.org/t/p/w300/";
    return baseImageUrl + movie.poster_path;
  }
}

function markerLocations() {
  var positions = [
    {position: [41.8781, -87.6298],
    draggable: true},
    {position: [44.28952958093682, -86.152559438984804]},
    {position: [42.28952958093682, -88.1501188139848408]},
    {position: [44.88952958093682, -87.0000188139848408]}
  ];

  for (var i=0; i<positions.length; i++){
    model.currentLocations.push(positions[i]);
  };
};

function fetchMovie(callback, title) {
  // model.currentTitles = [];
  // model.windows = [];
  $.ajax({
    url: tmdbApi.root + "/search/movie",
    data: {
      api_key: tmdbApi.token,
      query: title,
      include_adult: false
    },
    success: function(response) {
      model.currentTitles = response.results;
      console.log(model.currentTitles);

      model.currentTitles.forEach(function(movie) {

        var title = $("<h6></h6>").text(movie.title);

        var year = $("<h6></h6>").text(movie.release_date.slice(0, 4));

        // TODO fix this
        // var poster = $("<img></img>")
        //   .attr("src", tmdbApi.posterUrl(movie))
        //   .attr("class", "img-responsive");

        var windowHeading = $("<div></div>")
          .attr("class", "panel-heading")
          .append([title, year]);

        var windowBody = $("<div></div>")
          .attr("class", "panel-body")
          .append("<p>This will be a poster</p>");

        var windowView = $("<div></div>")
          .append([windowHeading, windowBody])
          .attr("class", "panel panel-default");
                // TODO checkout bootstrap panels

        model.windows.push(windowView);

      });
      console.log(model.windows)
      callback();
    }
  });
};



// function goToCoordinates(location) {
//
//   $.ajax({
//     url: "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyBH1GdmBFyhL3U_AqZLzMk_iQl5NXuU-Mc&address=" + location,
//     success: function(response) {
//       // console.log(response.results[0].geometry.location);
//       var isRealLocation = response.results.length > 0;
//       if (!isRealLocation) {
//         // TODO DISPLAY ERROR
//       } else {
//         var coordinates = response.results[0].geometry.location;
//         model.currentLocation = {
//           lat: coordinates.lat,
//           lng: coordinates.lng
//         };
//         console.log(model.currentLocation);
//
//         changeCenter(model.currentLocation);
//       }
//     },
//     error: function(err) {
//       console.log(err);
//     }
//   });
// }


// Map

// function addMarkers() {
//   for (var i=0; i<model.currentLocations.length; i++) {
//     model.addresses.push("{address: " + model.currentLocations[i] + "}")
//   };
//   console.log(addresses);
// };

// function changeCenter(center) {
//   $("#gmap3").gmap3.setCenter(center);
//   $("#gmap3").gmap3.setZoom(11);
// may not need above function, but keep TODO

// TODO set zoom based on location Info
  // low for countries, 11 for cities, high for street level. Write function that takes searchTerm and determines location type(country, city, zip, street level address, etc)


// DOM Event Handlers

function render() {

  model.currentLocations = [];

  markerLocations();

  $("#test-space").append(model.windows);

  $("#gmap3")
    .gmap3({
      address: model.currentLocation,
      zoom: model.zoom
    })
    // .cluster({
    //   size: 50,
    .marker(
      model.currentLocations
    )
    .wait(2000)
    .fit()
      // TODO attach correct model.windows to each marker
      // TODO figure out why blank infowindow appears over content infowindow
    .infowindow({
      content: ""
    })
    .then(function(infowindow) {
      var map = this.get(0);
      var markers = this.get(1);
      // for (var i=0; i<markers.length; i++) {
      markers.forEach(function(marker){
        console.log(marker);
        marker.addListener('mouseover', function() {
          if (model.windows.length > 0) {
            // TODO map windows to markers
            infowindow.setContent(model.windows[0][0]);
          } else {
            infowindow.setContent("No information available");
          }
        });
        marker.addListener('click', function() {
          infowindow.open(map, marker);
        });
      });
    });
};


function search(callback) {
  var searchTerm = "";
  $("#search-param").change(function () {
    $("#search-term").attr("placeholder", ($(this).val() == "title-search") ? "Enter movie title" : "Enter location")
  });
  $("#search").submit(function(evt) {
    evt.preventDefault();
    searchTerm = $("#search-term").val();
    if ($("#search-param").val() == "title-search") {
      fetchMovie(callback, searchTerm);


      // TODO write this function
      // displayTitleLocations(searchTerm);

    } else if ($("#search-param").val() == "location-search") {
      model.currentLocation = $("#search-term").val();
      // TODO get coordinates and rerender
      // callback();

      // TODO call myAPIfilms with searchTerm as location
    } else {
      // TODO display error "must choose search parameter"
      console.log("error");
    }
  });
  callback();
};

$("document").ready(function(){
  search(render);
});
