var map;
var selectedMarker;

// init map. place the marker where you are.
function initMap() {

    document.getElementById('destination-search').addEventListener('click', SearchPlaces);
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 10
    });
    viewModel.setMap(map);
    var infoWindow = new google.maps.InfoWindow;

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            viewModel.SearchingParameter().CurrentPosition(pos);
            infoWindow.setPosition(pos);
            infoWindow.setContent('You are here');
            infoWindow.open(map);
            map.setCenter(pos);

            var marker = makeMarker(pos, 'You are here', 0, '#f49842', mapIcons.shapes.MAP_PIN, 'male');

            SearchPlaces();
        }, function() {
            handleLocationError(true, infoWindow, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, infoWindow, map.getCenter());
    }
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
    infoWindow.setPosition(pos);
    infoWindow.setContent(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.');
    infoWindow.open(map);
}

function SearchPlaces() {
//    var bounds = map.getBounds();
//    hideMarkers(placeMarkers);
    var placesService = new google.maps.places.PlacesService(map);

    console.log(viewModel.SearchingParameter().CurrentPosition());
    console.log(viewModel.SearchingParameter().radius());
    console.log(viewModel.SearchingParameter().filter());

    var request = {
        location: viewModel.SearchingParameter().CurrentPosition(),
        radius: viewModel.SearchingParameter().radius(),
        name: viewModel.SearchingParameter().filter(),
        type: [viewModel.SearchingParameter().mode()]
    };
    
    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);
}
    
function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        createMarkersForPlaces(results);
    }
    else {
        alert('status code ' + status + ', please check later.');
    }
}

function setMarkers(mk, m) {
    var mkarray = mk();
    for(var i=0; i<mkarray.length; i++) {
        mkarray[i].marker().setMap(m);
    }
}

// createmarkers.
function createMarkersForPlaces(places) {
    setMarkers(viewModel.getViewArray(), null);
    viewModel.clearList();
    var bounds = new google.maps.LatLngBounds();
    //    bounds = map.getBounds();
    for (var i = 0; i < places.length; i++) {
        var place = places[i];
        // Create a marker for each place.
        var marker = makeMarker(place.geometry.location, place.name, place.id, '#38e0b3', mapIcons.shapes.MAP_PIN, 'walking');
        marker.addListener('click', toggleBounce);

        // init info window.
        var infow = new google.maps.InfoWindow;
        infow.setPosition(place.geometry.location);
        infow.setContent('Not found in foursquare');
        infow.open(null);

        viewModel.pushViewArray(place.name, marker, infow);
        //        placeMarkers.push(marker);
        if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
        } else {
            bounds.extend(place.geometry.location);  
        }
    }
    bounds.extend(viewModel.SearchingParameter().CurrentPosition());
    map.fitBounds(bounds);
}

// make marker . input position, name, id, color, shape, type.
function makeMarker(pos, title, id, color, shape, type) {
    var rtn = new mapIcons.Marker({
        map: map,
        position: pos,
        title: title,
        animation: google.maps.Animation.DROP,
        id: id,
        icon: {
            path: shape,
            fillColor: color,
            fillOpacity: 1,
            strokeColor: '',
            strokeWeight: 0
        },
        map_icon_label: '<span class="map-icon map-icon-'+type+'"></span>'
    });
    return rtn;
}

// toggle the marker when clicked.
function toggleBounce() {
    var self = this;
    if(selectedMarker!=null && selectedMarker!=self) {
        selectedMarker.setAnimation(null);
    }
    if (self.getAnimation() !== null) {
        self.setAnimation(null);
    } else {
        self.setAnimation(google.maps.Animation.BOUNCE);
    }
    selectedMarker=self;
}

window.loadingError = function(){
    alert('google js loading error');
};