
// MODEL & HELPERS

var model = {
  map: document.getElementById("gmap3"),
  windows: [],
  imdbID: "",
  tmdbID: "",
  currentLocation: "Chicago",
  currentLocations: [],
  locationInfo: [],
  markerArray: [],
  zoom: 4
};

var myApiFilms = {
  root: "http://www.myapifilms.com/imdb/idIMDB",
  token: "54e5c6a2-c810-4e71-9f78-a376db353394"
};
var tmdbApi = {
  root: "https://api.themoviedb.org/3",
  token: "24758e2d6d872edf774b8e3777b4d0de", //

  posterUrl: function(movie) {
    var baseImageUrl = "http://image.tmdb.org/t/p/w300/";
    return baseImageUrl + movie.backdrop_path;
  }
};


function getShootingLocations() {
  // very slow
  $.ajax({
    url: myApiFilms.root,
    data: {
      idIMDB: model.imdbID,
      token: myApiFilms.token,
      filmingLocations: "2"
    },
    success: function(response) {
      // TODO WHY DOESN'T THIS WORK ANYMORE??
      var movie = response.data.movies[0];
      if (movie.filmingLocations !== undefined) {

        // var title = movie.title;
        // var addresses = [];
        // var remarks = [];
        movie.filmingLocations.forEach( function(index) {
          if (index.remarks) {
            model.locationInfo.push({address: index.location, remarks: index.remarks});
          } else {
            model.locationInfo.push({address: index.location, remarks: "No scene information available"});
          }
          // addresses.push(index.location);
          // remarks.push(index.remarks);
        });
        // model.currentLocations = addresses;
        // model.locationInfo.map(
        //   {title: title,
        //   address: addresses,
        //   remarks: remarks}


        $("#gmap3")
          .gmap3({
            zoom: model.zoom
          })
          .marker(function() {
            for (var i=0; i<model.locationInfo.length; i++) {
              model.markerArray.push({address: model.locationInfo[i].address, title: model.locationInfo[i].address});
            };
            return model.markerArray;
          })
          .wait(2000)
          .fit()
            // TODO attach correct model.windows to each marker
          .infowindow({
            // content: "",
            maxWidth: 250
          })
          .then(function(infowindow) {
            var map = this.get(0);
            var markers = this.get(2);
            var locationDiv = $('<div id="location-div"></div>');
            // for (var i=0; i<markers.length; i++) {
            markers.forEach(function(marker){
              console.log(marker);
              marker.addListener('mouseover', function() {
                model.locationInfo.forEach(function(locationObj){
                  if (locationObj.address === marker.title) {
                    var locationWinContent = "<p>" + locationObj.address + "</p><p>" + locationObj.remarks + "</p>";
                    locationDiv.append(locationWinContent);
                    infowindow.setContent(locationWinContent);
                  }
                  // TODO map windows to markers
                  marker.addListener('click', function() {
                    infowindow.open(map, marker);
                  });

              });
            });
          });
        });
      } else {
        console.log("No locations");
      }
    },
    error: function(err) {
      console.log(err);
    }
// initMap();
  });
};

function fetchMovie(id) {
  model.windows = [];
  model.currentLocations = [];
  model.locationInfo = [];
  model.markerArray = [];
  $("#movie-info").empty();


  $.ajax({
    url: tmdbApi.root + "/movie/"+ id,
    data: {
      api_key: tmdbApi.token
    },
    success: function(response) {
      model.imdbID = response.imdb_id;
      var poster;
      if (response.poster_path != null) {
        poster = $("<img id='poster'></img>")
          .attr("src", tmdbApi.posterUrl(response))
          // .attr("class", "img-responsive");
      } else {
        poster = $("<p>No poster to display</p>");
      }

      var year = $("<h6 id='panel-year'></h6>").text(response.release_date.slice(0, 4));

      var title = $("<h6 id='panel-title'></h6>").text(response.title.toUpperCase());

      var overview = $("<p id='panel-overview'></p>").text(response.overview);

      // var locationDiv =
      // $("<div id='location-div'></div>");

      // var locations = getShootingLocations();

      var sidebarView = $("<div></div>")
        .attr("class", "panel-body")
        // .attr("width", "50%")
        .attr("class", "panel panel-default")
        .append([poster, title, year, overview]);

              // TODO checkout bootstrap panels

      $("#movie-info").append(sidebarView);
      // model.windows.push(sidebarView);
    },
    error: function(err) {
      console.log(err);
    }
  });
};


// DOM Event Handlers
function initMap() {
  // model.currentLocations = [];
  // markerLocations();
  $("#gmap3")
    .gmap3({
      address: model.currentLocation,
      zoom: model.zoom,
      mapTypeId: "Choose Theme",
      mapTypeControlOptions: {
        mapTypeIds: ["Choose Theme"],
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.TOP_CENTER
      },
      streetViewControl: false
    })
    .styledmaptype(
      "Choose Theme",
      [
        {"featureType": "administrative","elementType": "labels.text.fill","stylers": [{"color": "#444444"}]},
        {"featureType": "landscape","elementType": "all","stylers": [{"color": "#f2f2f2"}]},
        {"featureType": "poi","elementType": "all","stylers": [{"visibility": "off"}]},
        {"featureType": "road","elementType": "all","stylers": [{"saturation": -100},{"lightness": 45}]},
        {"featureType": "road.highway","elementType":"all","stylers": [{"visibility": "simplified"}]},
        {"featureType": "road.arterial","elementType": "labels.icon","stylers": [{"visibility": "off"}]},
        {"featureType": "transit","elementType": "all","stylers": [{"visibility": "off"}]},
        {"featureType": "water","elementType": "all","stylers": [{"color": "#46bcec"},{"visibility": "on"}]}
      ],
      {name: "Choose Theme"}
    )
    // .cluster({
    //   size: 50,
};


function search() {

  var titleList;

  $("#click").click(function(){
    // $("#panel").animate({width:"toggle"}, 250);
    $("#panel").slideToggle(250);
  });

  $("#search-term").autocomplete({
    source: function(request, response) {
      $.ajax({
        url: tmdbApi.root + "/search/movie",
        data: {
          query: request.term,
          api_key: tmdbApi.token,
          include_adult: false
        },
        success: function(respObj) {
          titleList=[];
          var movies = respObj.results;
          movies.forEach(function(movie){
            if (movie.title.toLowerCase().indexOf(request.term) === 0) {
              if (movie.poster_path != null) {
                titleList.push({
                  label: movie.title + "   (" + movie.release_date.slice(0,4) + ")",
                  value: movie.id
                });
              }
            }
            response(titleList);
          });
        }
      });
    },
    minLength: 2,
    autoFocus: true,
    select: function(event, ui) {
      event.preventDefault();
      $("#search-term").val(ui.item.label.slice(0, ui.item.label.length - 6));
      model.currentFilm = ui.item.value;
      fetchMovie(model.currentFilm);
    }
  });
  initMap();
};

$(document).ready(function(){
  search();
});


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

// function changeCenter(center) {
//   $("#gmap3").gmap3.setCenter(center);
//   $("#gmap3").gmap3.setZoom(11);
// may not need above function, but keep TODO

// TODO set zoom based on location Info
  // low for countries, 11 for cities, high for street level. Write function that takes searchTerms and determines location type(country, city, zip, street level address, etc)
