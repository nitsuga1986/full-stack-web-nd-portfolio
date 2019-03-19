var map;
var markers = [];
var largeInfowindow, hoverInfowindow;
var autocomplete, geocoder, bounds;
var drawingManager
var polygon = null; // This global polygon variable is to ensure only ONE polygon is rendered.
var placeMarkers = []; // Create placemarkers array to use in multiple functions to have control over the number of places that show.

// Function is called when the maps API script is loaded
function initMap() {
  var styles = [{"featureType":"all","elementType":"geometry.fill","stylers":[{"weight":"2.00"}]},{"featureType":"all","elementType":"geometry.stroke","stylers":[{"color":"#9c9c9c"}]},{"featureType":"all","elementType":"labels.text","stylers":[{"visibility":"on"}]},{"featureType":"landscape","elementType":"all","stylers":[{"color":"#f2f2f2"}]},{"featureType":"landscape","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"landscape.man_made","elementType":"geometry.fill","stylers":[{"color":"#ffffff"}]},{"featureType":"poi","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"road","elementType":"all","stylers":[{"saturation":-100},{"lightness":45}]},{"featureType":"road","elementType":"geometry.fill","stylers":[{"color":"#eeeeee"}]},{"featureType":"road","elementType":"labels.text.fill","stylers":[{"color":"#7b7b7b"}]},{"featureType":"road","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]},{"featureType":"road.highway","elementType":"all","stylers":[{"visibility":"simplified"}]},{"featureType":"road.arterial","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"transit","elementType":"all","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"all","stylers":[{"color":"#46bcec"},{"visibility":"on"}]},{"featureType":"water","elementType":"geometry.fill","stylers":[{"color":"#c8d7d4"}]},{"featureType":"water","elementType":"labels.text.fill","stylers":[{"color":"#070707"}]},{"featureType":"water","elementType":"labels.text.stroke","stylers":[{"color":"#ffffff"}]}]
  // Constructor creates a new map - only center and zoom are required.
  // Starting center is San Francisco :)
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.608046, lng: -58.39347},
    styles: styles,
    zoom: 15,
    zoomControl: true,
    zoomControlOptions: {
        position: google.maps.ControlPosition.TOP_LEFT
    },
    mapTypeControlOptions: {
         position: google.maps.ControlPosition.TOP_RIGHT
    },
  });
  bounds = new google.maps.LatLngBounds();
  google.maps.event.addDomListener(window, 'resize', function() {
    if (bounds) {map.fitBounds(bounds)};
  });
  // InfoWindow that is shown on sidebar click events
  largeInfowindow = new google.maps.InfoWindow();

  // Setup autocomplete in the location searchbar
  initSearch()

  // Initialize the drawing manager.
  drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.POLYGON,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_LEFT,
      drawingModes: [
        google.maps.drawing.OverlayType.POLYGON
      ]
    }
  });

  // Add an event listener so that the polygon is captured,  call the
  // searchWithinPolygon function. This will show the markers in the polygon,
  // and hide any outside of it.
  drawingManager.addListener('overlaycomplete', function(event) {
    // First, check if there is an existing polygon.
    // If there is, get rid of it and remove the markers
    if (polygon) {
      polygon.setMap(null);
      hideListings(markers);
    }
    // Switching the drawing mode to the HAND (i.e., no longer drawing).
    drawingManager.setDrawingMode(null);
    // Creating a new editable polygon from the overlay.
    polygon = event.overlay;
    polygon.setEditable(true);
    // Searching within the polygon.
    searchWithinPolygon();
    // Make sure the search is re-done if the poly is changed.
    polygon.getPath().addListener('set_at', searchWithinPolygon);
    polygon.getPath().addListener('insert_at', searchWithinPolygon);
  });

  // To make sure map markers always fit on screen as user resizes their browser window:
  google.maps.event.addDomListener(window, 'resize', function() {
    map.fitBounds(bounds); // `bounds` is a `LatLngBounds` object
  });

  // Setup and start our App and appViewModel instances.
  app.init();
  ko.applyBindings(appViewModel);
}

// Function that gets called as an html attribute if the api is unable
// to be reached.
function loadError() {
  alert("Google maps was unable to be loaded!");
}

function initSearch() {
  var input = document.getElementById('location-input');
  autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);
  geocoder = new google.maps.Geocoder();
}

function searchPlace(val) {
  // Close the any infowindos that are open
  largeInfowindow.close();
  var bounds = map.getBounds();
  var placesService = new google.maps.places.PlacesService(map);
  placesService.textSearch({
    query: val,
    bounds: bounds
  }, function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      createMarkersForPlaces(results);
    }
  });
}

// This function creates markers for each place found in either places search.
function createMarkersForPlaces(places) {
  console.log(places);
  var bounds = new google.maps.LatLngBounds();
  for (var i = 0; i < places.length; i++) {
    var place = places[i];
    var icon = {
      url: place.icon,
      size: new google.maps.Size(35, 35),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(15, 34),
      scaledSize: new google.maps.Size(25, 25)
    };
    // Create a marker for each place.
    var marker = new google.maps.Marker({
      map: map,
      icon: icon,
      title: place.name,
      position: place.geometry.location,
      id: place.id
    });
    markers.push(marker);
    bounds.extend(markers[i].position);
  }
}

function geocodeAddress(address, geocoder, resultsMap, app) {
  geocoder.geocode({'address': address}, function(results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
      console.log(results[0]);

    } else {
      alert("Sorry, Google couldn't find that location.");
    }
  });
}

// Reset and populate marker list, pulling data from resultList in
// the appViewModel. Accessing it globally to save time copying it over.
function setMarkers(list) {
  // Our custom marker icon
  var locationIcon = {
        anchor: new google.maps.Point(11,17),
        path: 'M22-48h-44v43h16l6 5 6-5h16z',
        fillColor: '#7C4599',
        fillOpacity: 0.9,
        scale: 0.5,
        strokeColor: '#FFC21F',
        strokeWeight: 1,
        labelOrigin: new google.maps.Point(0, -25)
      };
  // Reset bounds variable
  bounds = new google.maps.LatLngBounds();
  // Clear the markers array before repopulating it
  deleteMarkers();
  // Use results from resultList to populate marker information.
  var result;
  for (var i = 0; i < list.length; i++) {
    // Create a local copy for easy access
    result = list[i];
    // Create a new marker for each result
    var marker = new google.maps.Marker({
      map: map,
      animation: google.maps.Animation.DROP,
      position: result.location,
      label: {
        text: result.id() + '',
        color: '#FFC21F',
        fontSize: '12px',
        fontWeight: '500'
      },
      name: result.title,
      imgSrc: result.imgSrc,
      address: result.address,
      city: result.city,
      url: result.url,
      id: result.id,
      lat: result.location.lat,
      lng: result.location.lng,
      squareInfo: result.squareInfo,
      icon: locationIcon,
    });
    markers.push(marker);
    // Create an onclick event to open an infowindow at each marker.
    marker.addListener('click', function() {
      animateMarker(-1, this);
      populateInfoWindow(this, largeInfowindow, 'closeclick');
    });
    // Show the hoverInfoWindow when a mouseover happens on the marker.
    marker.addListener('mouseover', function() {
      // populateInfoWindow(this, hoverInfowindow, 'mouseout');
    });
    bounds.extend(markers[i].position);
  }
  // Extend the boundaries of the map for each marker if zoom option is set
  map.fitBounds(bounds);
}

// This function will show the infoWindow for a given marker. We also
// specify the close event here.
function populateInfoWindow(marker, infoWindow, onCloseEvent) {
  // Always close the existing infowindow first
  largeInfowindow.close();
  // Set the infoWindow on the marker
  infoWindow.marker = marker;
  // Set base content for InfoWindow
  var baseContent = '<div  id="markerWindow" class=" d-flex">' +
    '<imgclass="result-img" data-bind="attr:{src: squareImagePath}">' +
    '<div class="result-text-container">' +
      '<h3 class="result-title">' + marker.label.text + '. ' + marker.name + '</h3>' +
      '<h4 class="result-subtitle" data-bind="text: squareAddress"></h4>' +
      '<h4 class="result-subtitle" data-bind="text: squareCity"></h4>' +
      '<a data-bind="attr: { href: squareURL }">Website</a>' + '<br>' +
      '<button type="btn btn-secondary btn-sm" data-bind="click: toggleSV"><i class="fa fa-eye-slash" aria-hidden="true"></i> Street View</button>' +
    '<div>' +
    '<div id="pano" data-bind="visible: SVvisible"><div>No Street View Found</div></div>' +
  '</div>' + '</div>' + '</div>';

  var streetViewService = new google.maps.StreetViewService();
  var radius = 50;
  function getStreetView(data, status) {
    if (status == google.maps.StreetViewStatus.OK) {
      var nearStreetViewLocation = data.location.latLng;
      var heading = google.maps.geometry.spherical.computeHeading(
        nearStreetViewLocation, marker.position);
        var panoramaOptions = {
          position: nearStreetViewLocation,
          pov: {
            heading: heading,
            pitch: 30
          }
        };
      var panorama = new google.maps.StreetViewPanorama(
        document.getElementById('pano'), panoramaOptions);
    } else {
    }
  }
  // Use streetview service to get the closest streetview image within
  // 50 meters of the markers position
  streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
  // Open the infowindow on the correct marker.
  infoWindow.setContent(baseContent);
  // Display the infowindow
  infoWindow.open(map, marker);

  marker.addListener(onCloseEvent, function() {
    infoWindow.marker = null;
  });

  infoWindow.addListener(onCloseEvent, function() {
    // We only set the marker to null, we don't close it.
    // This is so the user can click on the link. A better way to allow
    // the user to click on the link would be to have an mouseover event
    // attached to the infowindow as well.
    infoWindow.marker = null;
  })

  if(!marker.squareInfo){
    marker.squareInfo = true;
    app.search4Square(marker);
  }else{
    appViewModel.squareURL = marker.squareURL;
    appViewModel.squareImagePath = marker.squareImagePath;
    appViewModel.squareAddress = marker.squareAddress;
    appViewModel.squareCity = marker.squareCity;
    ko.applyBindings(appViewModel, document.getElementById("markerWindow"));
  }
}

// Can pass in an index or a marker.
function animateMarker(index, marker) {
  var marker = markers[index] || marker;
  if (marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE)
    window.setTimeout(function() {
      marker.setAnimation(null);
    }, 500);
  }
}

// Hides markers that aren't found in the passed in array
function hideMarkers(array) {
  var validMarker = false;
  for (var i = 0; i < markers.length; i++) {
    for (var j = 0; j < array.length; j++) {
      if (markers[i].name === array[j].title) {
        validMarker = true;
        break;
      }
    }
    validMarker ? markers[i].setVisible(true) : markers[i].setVisible(false);
    validMarker = false;
  }
}

// Sets the map on all markers in the array.
function clearMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}

// This function will loop through the markers array and display them all.
function showListings() {
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}

// This function will loop through the listings and hide them all.
function hideListings() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

// This shows and hides (respectively) the drawing options.
function toggleDrawing() {
  if (drawingManager.map) {
    drawingManager.setMap(null);
    // In case the user drew anything, get rid of the polygon
    if (polygon !== null) {
      polygon.setMap(null);
    }
  } else {
    drawingManager.setMap(map);
  }
}

// This function hides all markers outside the polygon,
// and shows only the ones within it. This is so that the
// user can specify an exact area of search.
function searchWithinPolygon() {
  for (var i = 0; i < markers.length; i++) {
    if (google.maps.geometry.poly.containsLocation(markers[i].position, polygon)) {
      markers[i].setMap(map);
    } else {
      markers[i].setMap(null);
    }
  }
}
