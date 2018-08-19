var map, infoWindow;
var selectedMarker;
function initMap() {

    document.getElementById('destination-search').addEventListener('click', SearchPlaces);
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: -34.397, lng: 150.644},
        zoom: 10
    });
    infoWindow = new google.maps.InfoWindow;

    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            viewModel.SearchingParameter().CurrentPosition(pos);
            infoWindow.setPosition(pos);
            infoWindow.setContent('Location found.');
            //        infoWindow.open(map);
            map.setCenter(pos);

            var marker = makeMarker(pos, 'You are here', 0, 'blue');
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

function createMarkersForPlaces(places) {
    setMarkers(viewModel.getViewArray(), null);
    viewModel.clearList();
    var bounds = new google.maps.LatLngBounds();
    //    bounds = map.getBounds();
    for (var i = 0; i < places.length; i++) {
        var place = places[i];
        /*
        var icon = {
        url: place.icon,
        size: new google.maps.Size(35, 35),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(15, 34),
        scaledSize: new google.maps.Size(25, 25)
        };
        */
        // Create a marker for each place.
        var marker = makeMarker(place.geometry.location, place.name, place.id, 'red');
        marker.addListener('click', toggleBounce);
        /*
        // If a marker is clicked, do a place details search on it in the next function.
        marker.addListener('click', function() {
            getPlacesDetails(this, place);
        });
        */
        viewModel.pushViewArray(place.name, marker);
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

function makeMarker(pos, title, id, color) {
//    var icon = 'http://maps.google.com/mapfiles/ms/icons/'+color+'-dot.png';
//    icon = new google.maps.MarkerLabel({color: '#242f3e'});
    icon = null;
    var rtn = new google.maps.Marker({
        map: map,
        position: pos,
        title: title,
        animation: google.maps.Animation.DROP,
        //        icon: icon,
        id: id
    });
    return rtn;
}

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