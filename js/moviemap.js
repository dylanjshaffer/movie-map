
// MODEL & HELPERS

var model = {
  zoom: 4,
  activeWindow: null,
  imdbID: "",
  tmdbID: "",
  currentLocation: "Chicago",
  locationInfo: [],
  markerArray: [],
  markers: []
};

var locationDiv;
var map;
var bounds;

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
      var movie = response.data.movies[0];
      if (movie.filmingLocations !== undefined) {
        movie.filmingLocations.forEach( function(index) {
          if (index.remarks) {
            model.locationInfo.push({address: index.location, remarks: index.remarks});
          } else {
            model.locationInfo.push({address: index.location, remarks: "No scene information available"});
          }
        });


        $("#gmap3")
          .gmap3({
            zoom: model.zoom
          })
          .marker(getMarkers)
          .then(function(markers) {
            map = this.get(0);
            bounds = new google.maps.LatLngBounds();
            model.markers = markers;
            for (var i in model.markers) {
              bounds.extend(markers[i].getPosition());
            }
            map.fitBounds(bounds);
          })

          .infowindow({
            content: ""
          })
          .then(function(infowindow) {
            locationDiv = $('<div id="location-div"></div>');
            model.markers.forEach(function(marker) {
              console.log(marker);

              marker.addListener('click', function() {

                model.locationInfo.forEach(function(locationObj){
                  if (model.activeWindow != null) {
                    model.activeWindow.close();
                  }
                  if (locationObj.address === marker.title) {
                    var locationWinContent = "<p>" + locationObj.address + "</p><p>" + locationObj.remarks + "</p>";
                    locationDiv.append(locationWinContent);
                    infowindow.setContent(locationWinContent);
                    model.activeWindow = infowindow;
                  }
                  infowindow.open(map, marker);
                  map.addListener('click', function() {
                    infowindow.close();
                  });
                });
              });
            });
          })
          // .wait(2000)
          // .fit()
      } else {
        console.log("No locations");
      }
    },
    error: function(err) {
      console.log(err);
    }
  });
};

function fetchMovie() {
  model.locationInfo = [];
  model.markerArray = [];
  model.markers.forEach(function(marker){
    marker.setMap(null);
  });
  $("#movie-info").empty();


  $.ajax({
    url: tmdbApi.root + "/movie/"+ model.currentFilm,
    data: {
      api_key: tmdbApi.token
    },
    success: function(response) {
      model.imdbID = response.imdb_id;
      getShootingLocations();
      var poster;
      if (response.poster_path != null) {
        poster = $("<img id='poster'></img>")
          .attr("src", tmdbApi.posterUrl(response))
      } else {
        poster = $("<p>No poster to display</p>");
      }

      var year = $("<h6 id='panel-year'></h6>").text(response.release_date.slice(0, 4));

      var title = $("<h6 id='panel-title'></h6>").text(response.title.toUpperCase());

      var overview = $("<p id='panel-overview'></p>").text(response.overview);

      var sidebarView = $("<div></div>")
        .attr("class", "panel-body")
        .attr("class", "panel panel-default")
        .append([poster, title, year, overview]);

              // TODO checkout bootstrap panels

      $("#movie-info").append(sidebarView);
      $("#panel").slideDown(250);


    },
    error: function(err) {
      console.log(err);
    }
  });
};


// DOM Event Handlers
function initMap() {

  $("#gmap3")
    .gmap3({
      address: model.currentLocation,
      zoom: model.zoom,
      mapTypeId: "Default",
      mapTypeControl: false,
      // mapTypeControlOptions: {
      //   mapTypeIds: ["Default"],
      //   style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      //   position: google.maps.ControlPosition.TOP_CENTER
      // },
      streetViewControl: false
    })
    .styledmaptype(
      "Default",
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
      {name: "Default"}
    )
    // .marker({
    //   address: "chicago",
    //   icon: {
    //     path: fontawesome.markers.VIDEO_CAMERA,
    //     scale: 0.35,
    //     strokeWeight: 1,
    //     strokeColor: "black",
    //     fillColor: "#b60f0f",
    //     fillOpacity: 1
    //   }
    // })
};


function search() {

  var titleList;

  // $("#search-options").click(function(){
  //   $("#panel").slideToggle(250);
  // });

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
                  label: movie.title + " (" + movie.release_date.slice(0,4) + ")",
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
      $("#search-term").val(ui.item.label);
      model.currentFilm = ui.item.value;

      fetchMovie();
    }
  });
};


function getMarkers() {
  model.markers = [];
  for (var i=0; i<model.locationInfo.length; i++) {
    var currentLocation = model.locationInfo[i].address;
    getCoordinates(currentLocation);
  };
  return model.markerArray;
};


function getCoordinates(loc) {
  $.ajax({
    url: "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyBH1GdmBFyhL3U_AqZLzMk_iQl5NXuU-Mc&address=" + loc,
    async: false,
    success: function(response) {
      console.log(response.results);
      console.log(response.results[0].geometry.location);
      var isRealLocation = (response.results.length > 0);
      if (!isRealLocation) {
        console.log("not real");
      } else {
        var coordinates = response.results[0].geometry.location;
        model.markerArray.push({
          position:[coordinates.lat, coordinates.lng],
          title: loc,
          icon: {
            path: fontawesome.markers.VIDEO_CAMERA,
            scale: 0.35,
            strokeWeight: 1,
            strokeColor: "white",
            fillColor: "black",
            fillOpacity: 1
          }
        });

        console.log(model.markerArray);
      }
    },
    error: function(err) {
      console.log(err);
    }
  });
}

$(document).ready(function(){
  initMap();
  search();
});
