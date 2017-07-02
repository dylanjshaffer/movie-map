
// MODEL

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

// APIs

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


// HELPERS

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
    // TODO async:false is deprecated
    async: false,
    success: function(response) {
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
      }
    },
    error: function(err) {
      console.log(err);
    }
  });
}


function getShootingLocations() {
  // API is very slow
  $.ajax({
    url: myApiFilms.root,
    data: {
      idIMDB: model.imdbID,
      token: myApiFilms.token,
      filmingLocations: "2"
    },
    success: function(response) {
      var movie = response.data.movies[0];
      console.log(response);
      if (movie.filmingLocations !== undefined) {
        movie.filmingLocations.forEach( function(index) {
          if (index.remarks) {
            model.locationInfo.push({address: index.location, remarks: index.remarks});
          } else {
            model.locationInfo.push({address: index.location, remarks: ""});
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

            infowindow.addListener('domready', function(){
              var iwOuter = $('.gm-style-iw');
              var iwBackground = iwOuter.prev();
              iwBackground.children(':nth-child(2)').css({'display':'none'});
              iwBackground.children(':nth-child(4)').css({'display':'none'});
              iwBackground.children(':nth-child(3)').find('div').children().css({'box-shadow': 'rgba(72, 181, 233, 0.6) 0px 1px 6px', 'z-index':'1'});
              var iwCloseBtn = iwOuter.next();
              iwCloseBtn.css({"display":"none"});
            });

            model.markers.forEach(function(marker) {

              marker.addListener('click', function() {

                model.locationInfo.forEach(function(locationObj){
                  if (model.activeWindow != null) {
                    model.activeWindow.close();
                  }
                  if (locationObj.address === marker.title) {

                    var streetViewUrl = 'https://maps.googleapis.com/maps/api/streetview?size=300x150&location=' + locationObj.address;

                    var address = $("<h5 id='iw-address'></h5>").html("<span>" + locationObj.address + "</span>");

                    var remarks = $("<p id='iw-remarks'></p>").html("<span>" + locationObj.remarks + "</span>");

                    var locationWinContent = $("<div id=location-div></div>")
                      .css("background-image", "url('" + streetViewUrl + "')")
                      .append([address, remarks]);

                    infowindow.setContent(locationWinContent[0]);
                    model.activeWindow = infowindow;
                    map.setCenter(infowindow);
                  }
                  infowindow.open(map, marker);
                  map.addListener('click', function() {
                    infowindow.close();
                  });
                });
              });
            });
          })
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

      var overview = $("<p id='panel-overview'></p>").text(response.overview);

      $("#bg-img").attr("src", tmdbApi.posterUrl(response));
      $("#movie-info").append(overview);


              // TODO checkout bootstrap panels

      $("#panel").slideDown(250);


    },
    error: function(err) {
      console.log(err);
    }
  });
};


// MAP

function initMap() {

  $("#gmap3")
    .gmap3({
      address: model.currentLocation,
      zoom: model.zoom,
      mapTypeId: "Default Theme",
      mapTypeControl: true,
      mapTypeControlOptions: {
        mapTypeIds: ["Default Theme", "Noir", "Western", "Sci-Fi"],
        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: google.maps.ControlPosition.BOTTOM_CENTER
      },
      streetViewControl: false
    })
    .styledmaptype(
      "Default Theme",
      [{"featureType": "administrative","elementType": "labels.text.fill","stylers": [{"color": "#444444"}]},
      {"featureType": "landscape","elementType": "all","stylers": [{"color": "#f2f2f2"}]},
      {"featureType": "poi","elementType": "all","stylers": [{"visibility": "off"}]},
      {"featureType": "road","elementType": "all","stylers": [{"saturation": -100},{"lightness": 45}]},
      {"featureType": "road.highway","elementType":"all","stylers": [{"visibility": "simplified"}]},
      {"featureType": "road.arterial","elementType": "labels.icon","stylers": [{"visibility": "off"}]},
      {"featureType": "transit","elementType": "all","stylers": [{"visibility": "off"}]},
      {"featureType": "water","elementType": "all","stylers": [{"color": "#46bcec"},{"visibility": "on"}]}],
      {name: "Default Theme"})
    .styledmaptype(
      "Noir",
      [{"featureType":"all","elementType":"all","stylers":[{"hue":"#ff0000"},{"saturation":-100},{"lightness":-30}]},
      {"featureType":"all","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},       {"featureType":"all","elementType":"labels.text.stroke","stylers":[{"color":"#353535"}]},
      {"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#656565"}]},
      {"featureType":"poi","elementType":"geometry.fill","stylers":[{"color":"#505050"}]},
      {"featureType":"poi","elementType":"geometry.stroke","stylers":[{"color":"#808080"}]},
      {"featureType":"road","elementType":"geometry","stylers":[{"color":"#454545"}]}],

      {name: "Noir"})
    .styledmaptype(
      "Western",
      [{"featureType":"landscape","elementType":"all","stylers":[{"hue":"#FFAD00"},{"saturation":50.2},{"lightness":-34.8},{"gamma":1}]},
      {"featureType":"landscape.natural.landcover","elementType":"geometry.fill","stylers":[{"color":"#cbb42e"},{"visibility":"on"}]},
      {"featureType":"poi","elementType":"all","stylers":[{"hue":"#FFC300"},{"saturation":54.2},{"lightness":-14.4},{"gamma":1}]},
      {"featureType":"road.highway","elementType":"all","stylers":[{"hue":"#FFAD00"},{"saturation":-19.8},{"lightness":-1.8},{"gamma":1}]},
      {"featureType":"road.arterial","elementType":"all","stylers":[{"hue":"#FFAD00"},{"saturation":72.4},{"lightness":-32.6},{"gamma":1}]},
      {"featureType":"road.local","elementType":"all","stylers":[{"hue":"#FFAD00"},{"saturation":74.4},{"lightness":-18},{"gamma":1}]},
      {"featureType":"water","elementType":"all","stylers":[{"hue":"#00FFA6"},{"saturation":-63.2},{"lightness":38},{"gamma":1}]},
      {"featureType":"water","elementType":"geometry.fill","stylers":[{"visibility":"on"},{"color":"#ffe59c"}]}],
      {name: "Western"})
    .styledmaptype(
      "Sci-Fi",
      [{"featureType":"all","elementType":"labels.text.fill","stylers":[{"color":"#ffffff"}]},
      {"featureType":"all","elementType":"labels.text.stroke","stylers":[{"color":"#000000"},{"lightness":13}]},
      {"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#144b53"},{"lightness":14},{"weight":1.4}]},
      {"featureType":"landscape","elementType":"all","stylers":[{"color":"#08304b"}]},
      {"featureType":"poi","elementType":"geometry","stylers":[{"color":"#0c4152"},{"lightness":5}]},
      {"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},
      {"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#0b434f"},{"lightness":25}]},
      {"featureType":"road.arterial","elementType":"geometry.fill","stylers":[{"color":"#000000"}]},{"featureType":"road.arterial","elementType":"geometry.stroke","stylers":[{"color":"#0b3d51"},{"lightness":16}]},
      {"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"}]},
      {"featureType":"transit","elementType":"all","stylers":[{"color":"#146474"}]},
      {"featureType":"water","elementType":"all","stylers":[{"color":"#021019"}]}],
      {name: "Sci-Fi"})
    .infowindow({
      content: ""
    })
};


function search() {

  var titleList;

  $("#panel").click(function(){
    $("#panel-overview").slideToggle(250);
  });

  $("#search-term").autocomplete({
    source: function(request, response) {
      $.ajax({
        url: tmdbApi.root + "/search/movie",
        data: {
          query: request.term,
          api_key: tmdbApi.token,
          include_adult: false,
          results: 5
        },
        success: function(respObj) {
          titleList=[];
          var movies = respObj.results;
          movies.forEach(function(movie){
            if (movie.title.toLowerCase().indexOf(request.term.toLowerCase()) === 0) {
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


$(document).ready(function(){
  initMap();
  search();
});
