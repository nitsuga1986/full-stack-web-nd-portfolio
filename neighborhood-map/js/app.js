'use-strict';

// The App function is separate from the appViewModel to organize code better.
// It handles APIs requests as well as call initialization code.
var App = function() {

  // Locations used on this API
  var locationsArray = [];



  // Base url for locations array
  this.locationsurl = 'locations.json'; //&query= + this.place

  // This function will load the map, and init the markers
  this.init = function() {
    $.ajax({
        dataType: "json",
        url: this.locationsurl,
        mimeType: "application/json",
        success: function(locationsArray){
            appViewModel.parseData(locationsArray);   // Locations to observable objects
            setMarkers(appViewModel.resultList());    // From map.js, initialize the markers after data loaded
            appViewModel.sortByTitle();               // Sort locations by Title
        },
        error: function(){
          alert("Sorry, can't connect to the Locations server");
        }
    });
    this.getWeather();                        // Get current weather from API
  };

  // FOURSQUARE API ----

  // Client data to access the API
  var CLIENT_ID = '2SYJIYT3OKJD4KNMXRBQ0RZBM30PNNRZ3QRGPJB2LJKOYT21';
  var CLIENT_SECRET = 'WJ0VZI2TE4AKYWPYQ11OASI0N3TXYYY52CZVEH12SX3EXX5X';

  // Base url for Foursquare API
  this.squareurl = 'https://api.foursquare.com/v2/venues/search?intent=browse&limit=1&radius=800&venuePhotos=1&v=20170101'; //&query= + this.place

  // This function will make a request to the Foursquare API and call
  // parseData in the appViewModel instance.
  this.search4Square = function(marker) {
    // Create our AJAX request
    var httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
      alert("Sorry, can't connect to the Foursquare server");
      return false;
    }
    // Setup the function to execute on result as well as error handling
    httpRequest.onreadystatechange = function() {
      if (httpRequest.readyState == XMLHttpRequest.DONE) {
        if (httpRequest.status == 200) {
          var response = JSON.parse(httpRequest.responseText).response;
          // Update Result info with 4square data
          for (var i = 0, len = markers.length; i < len; i++) {
              if (markers[i].id === marker.id){
                // Save 4square info in markers objects
                if (response.venues === undefined || response.venues[0] === undefined){response.venues = [{"location":""}];}
                appViewModel.squareURL = response.venues[0].squareurl || 'No url';
                if (response.venues[0].categories) {
                  appViewModel.squareImagePath = response.venues[0].categories[0].icon.prefix + '512'+
                                                  response.venues[0].categories[0].icon.suffix;
                } else {
                  appViewModel.squareImagePath = 'https://ss3.4sqi.net/img/categories_v2/arts_entertainment/museum_art_512.png';
                }
                appViewModel.squareAddress = response.venues[0].location.address || 'No address';
                appViewModel.squareCity = response.venues[0].location.city || 'Buenos Aires';
                // Save 4square info in markers objects
                markers[i].squareURL = appViewModel.squareURL;
                markers[i].squareImagePath = appViewModel.squareImagePath;
                markers[i].squareAddress = appViewModel.squareAddress;
                markers[i].squareCity = appViewModel.squareCity;
                console.log(response);
                ko.applyBindings(appViewModel, document.getElementById("markerWindow"));
              }
          }
        } else {
          alert("Sorry, we couldn't load data from Foursquare at this time. \n\nThis is what we know: " +
           httpRequest.status + " " +
           httpRequest.statusText);
        }
      }
    };
    // Eror handling
    httpRequest.onerror = function () {
      alert("An error occurred during the Foursquare transaction");
    };
    // Once it's all setup, make the request
    httpRequest.open('GET', this.squareurl + '&ll=' + marker.lat + ',' + marker.lng + '&query=' + marker.name + '&client_id=' + CLIENT_ID + '&client_secret=' + CLIENT_SECRET);
    httpRequest.send();
  };

  // OPEN WEATHER MAP API ----

  // Client services to access the API
  var APPID = 'c99c50e688772c01d377b0226058d450';

  // Base url for Open Weather Map API
  this.openWeatherMapUrl = 'https://api.openweathermap.org/data/2.5/weather?lat=-34.608046&lon=-58.39347&units=metric&APPID=';

  // Get weather form Open Weather Map API
  this.getWeather = function() {
    // Create AJAX request
    var httpRequest = new XMLHttpRequest();
    if (!httpRequest) {
      alert("Sorry, can't connect to the Open Weather Map server");
      return false;
    }
    // Setup the function to execute on result as well as error handling
    httpRequest.onreadystatechange = function() {
      if (httpRequest.readyState == XMLHttpRequest.DONE) {
        if (httpRequest.status == 200) {
          var response = JSON.parse(httpRequest.responseText);
          // Update view
          appViewModel.weatherIcon('http://openweathermap.org/img/w/' + response.weather[0].icon + '.png');
          appViewModel.weatherTemp('Current Temp: ' + response.main.temp + ' ºC');
          appViewModel.weatherTempmaxmin('Max: ' + response.main.temp_max + ' ºC / Min:  ' + response.main.temp_min + ' ºC');
          console.log(response);
        } else {
          alert("Sorry, we couldn't load data from Open Weather Map at this time. \n\nThis is what we know: " +
           httpRequest.status + " " +
           httpRequest.statusText);
        }
      }
    };
    // Eror handling
    httpRequest.onerror = function () {
      alert("An error occurred during the Open Weather Map transaction");
    };
    // Once it's all setup, make the request
    httpRequest.open('GET', this.openWeatherMapUrl + APPID);
    httpRequest.send();
  };

};

//  Result functional object
var Result = function(data) {
  this.id = ko.observable(0);
  this.title = data.title;
  this.address = data.location.address || 'No address';
  this.city = data.location.city || 'Buenos Aires';
  this.squareurl = data.id || 'wwww.wikipedia.org';
  this.location = {
    lng: data.location.lng,
    lat: data.location.lat
  };
};

var ViewModel = function() {
  var self = this;

  // Our array to hold all the parsed results
  this.resultList = ko.observableArray([]);
  this.userLocation = ko.observable('');
  this.filter = ko.observable('');
  // 4square info
  this.squareURL = ko.observable('');
  this.squareImagePath = ko.observable('');
  this.squareAddress = ko.observable('');
  this.squareCity = ko.observable('');
  // Open Weather info
  this.weatherTemp = ko.observable('');
  this.weatherTempmaxmin = ko.observable('');
  this.weatherIcon = ko.observable('');

  self.SVvisible = ko.observable(false);
  self.toggleSV =  function(){
     self.SVvisible(!self.SVvisible());
  };
  // This function will parse the json data object into result objects,
  // updating the resultList array as it goes.
  this.parseData = function(data) {
    // Remove the previous items in resultList when doing a fresh search
    self.resultList.removeAll();
    // Populate the results
    data.forEach(function(locationData) {
      self.resultList.push(new Result(locationData));
    });
  };

  // Sort & Filter functions
  this.sortByTitle = function() {
    setBtnClasses('titleBtn');
    self.resultList.sort(function(a,b) {
      return (a.title === b.title) ? 0 : (a.title < b.title ? -1 : 1);
    });
    updateResultID();
    setMarkers(self.resultList());
  };

  // This function will intercept the filteredItems.computed and pass it on
  // to the google maps marker's list
  ko.extenders.notifyMarkers = function(target) {
    target.subscribe(function(array) {
      hideMarkers(array);
    });
    return target;
  };

  // This function will update our filteredItems list everytime the filter
  // observable changes. It is based on resultList, but doesn't modify it
  // directly. Thus our markers will be present, however the sidebar will be
  // updated with the filtered results.
  this.filteredItems = ko.computed(function() {
    var filter = this.filter().toLowerCase();
    // If our filter box is empty, return the original list
    if (!filter) {
      return self.resultList();
    }
    // Otherwise filter our array
    else {
      return ko.utils.arrayFilter(self.resultList(), function(result) {
        return result.title.toLowerCase().includes(filter);
      });
    }
  }, this)
    // Add our subscriber and limit the function to run once every 50ms
    .extend({notifyMarkers: '', rateLimit: 50});

  // Helper function that sets the filter input box value to ""
  this.clearFilter = function() {
    self.filter('');
  };

  this.search = function() {
    searchPlace(this.userLocation());
  };

  // This function will display the marker given a result index.
  // Triggered by clicking a result in the sidebar.
  this.showMarker = function(result) {
    var index = result.id() - 1;
    animateMarker(index);
    populateInfoWindow(markers[index], largeInfowindow, 'closeclick');
    scrollToTop();
  };

  // This function will toggle the slide-in animation for the filter module
  // which happens on a small screen.
  this.toggleFilters = function() {
    document.getElementById('filters').classList.toggle('slide-in');
  };

  // This function will toggle the slide-in animation for the result module
  // which happens on a small screen.
  this.toggleResults = function() {
    document.getElementById('spacer').classList.toggle('slide-out');
    $('.chevron').toggleClass('fa-chevron-down');
    $('.chevron').toggleClass('fa-chevron-up');
  };

  // This function will update the result IDs based off of their
  // position in the array. Called by the sorting functions.
  function updateResultID() {
    for (var i = 0; i < self.resultList().length; i++) {
      self.resultList()[i].id(i + 1);
    }
  }

};

// Helper function removes selected class from buttons and adds it
// to the button id passed in.
function setBtnClasses(selectedBtn) {
  //document.getElementById('titleBtn').classList.remove('filter-btn-selected');
  //document.getElementById(selectedBtn).classList.add('filter-btn-selected');
}

function scrollToTop() {
  if (window.innerWidth < 780) {
    window.scrollTo(0, 0);
  }
}

var app = new App();
var appViewModel = new ViewModel();
