
// MODEL & HELPERS

var model = {
  map: document.getElementById("gmap3"),
  windows: [],
  imdbID: "",
  tmdbID: "",
  currentLocation: "Chicago",
  currentLocations: [{address: "Chicago"}],
  locationInfo: [],
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
    console.log(baseImageUrl + movie.poster_path);
    return baseImageUrl + movie.poster_path;
  }
};


function getShootingLocations() {
  // very slow, possibly due to the free version of the API not accepting an array of IDs for a single AJAX request
  $.ajax({
    url: myApiFilms.root,
    data: {
      idIMDB: model.imdbID,
      token: myApiFilms.token,
      filmingLocations: "2"
    },
    success: function(response) {
      // TODO WHY DOESN'T THIS WORK ANYMORE??
      var movie = response.data.movies;
      if (movie[0].filmingLocations !== undefined) {
        var title = movie[0].title;
        var address = [];
        var remarks = [];
        movie[0].filmingLocations.forEach( function(index) {
          address.push(index.location);
          remarks.push(index.remarks);
        });

        model.currentLocations.push(address);

        model.locationInfo.push(
          {title: title,
          address: address,
          remarks: remarks}
        );
      } else {
        console.log("No locations");
      }


    // TODO geocode locations, or try creating address list like positions list in markerLocations() below

    },
    error: function(err) {
      console.log(err);
    }
  });
// render();
};

// function markerLocations() {
  // var positions = [
  //   {position: [41.8781, -87.6298],
  //   draggable: true},
  //   {position: [44.28952958093682, -86.152559438984804]},
  //   {position: [44.28952958093682, -40.152559438984804]},
  //   {position: [42.28952958093682, -88.1501188139848408]},
  //   {position: [44.88952958093682, -87.0000188139848408]}
  // ];

//   for (var i=0; i<model.locationInfo.length; i++){
//     positions.push(model.locationInfo.address[i]);
//   };
// };

function fetchMovie(id, callback) {
  model.windows = [];
  model.currentLocations = [];
  model.locationInfo = [];


  $.ajax({
    url: tmdbApi.root + "/movie/"+ id,
    data: {
      api_key: tmdbApi.token
    },
    success: function(response) {
      model.imdbID = response.imdb_id;
      // markerLocations();
      var poster;
      if (response.poster_path != null) {
        poster = $("<img></img>")
          .attr("src", tmdbApi.posterUrl(response))
          .attr("class", "img-responsive");
        console.log(tmdbApi.posterUrl(response));
      } else {
        poster = $("<p>No poster to display</p>");
      }

      var title = $("<h6></h6>").text(response.title);

      var year = $("<h6></h6>").text(response.release_date.slice(0, 4));

      var overview = $("<p></p>").text(response.overview);

      var windowHeading = $("<div></div>")
        .attr("class", "panel-heading")
        .attr("width", "50%")
        .append([poster]);

      var windowBody = $("<div></div>")
        .attr("class", "panel-body")
        .attr("width", "50%")
        .append([title, year, overview]);

      var windowView = $("<div></div>")
        .attr("class", "panel panel-default")
        .append([windowHeading, windowBody]);
              // TODO checkout bootstrap panels

      model.windows.push(windowView);
    },
    error: function(err) {
      console.log(err);
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

function addMarkers() {
  var markerArray = [];
  model.currentLocations.forEach(function(arr){
    arr.forEach(function(location) {
      markerArray.push(
        {address: location}
      );
    });
  });
  return markerArray;
  console.log(markerArray);
};

// function changeCenter(center) {
//   $("#gmap3").gmap3.setCenter(center);
//   $("#gmap3").gmap3.setZoom(11);
// may not need above function, but keep TODO

// TODO set zoom based on location Info
  // low for countries, 11 for cities, high for street level. Write function that takes searchTerms and determines location type(country, city, zip, street level address, etc)


// DOM Event Handlers
function render() {
  // model.currentLocations = [];
  // markerLocations();
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
      // content: "",
      maxWidth: 250
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


function search() {

  var titleList;

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

            console.log(titleList);
            response(titleList);
          });
        }
      });
    },
    minLength: 2,
    autoFocus: true,
    select: function(event, ui) {
      event.preventDefault();
      $("#search-term").val(ui.item.label.slice(0, ui.item.label.length - 9));
      model.currentFilm = ui.item.value;
      fetchMovie(model.currentFilm, getShootingLocations);
    }
  });
  render();
};

$("document").ready(function(){
  search();
});
