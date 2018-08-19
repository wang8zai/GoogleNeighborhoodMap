var viewModel = new APIViewModel();
var Types = ['library', 'restaurant', 'store','bank','museum','bar'];
var venuesHeader = 'https://api.foursquare.com/v2/venues/';
var client_id = 'P5MTQTPUXEAD1FEEU2OJ52ANWUKKBG2TMOWGPR4FNGCLZLEC';
var client_secret = 'TUTJJSHCLWMZ3OGFOXI4UIO3DBEJMJRVP1TDASVRZCGBSA3P';
function SearchModel(location, mode, radius, filter, pos) {
    var self = this;
    self.location = ko.observable(location);
    self.mode = ko.observable(mode);
    self.radius = ko.observable(radius);
    self.filter = ko.observable(filter);
    self.CurrentPosition = ko.observable(pos);
}

function optionModel(id,name){
    var self = this;
    self.id = ko.observable(id);
    self.name = ko.observable(name);
}

function detailModel(address, url, description, image) {
    var self = this;
    self.address = ko.observable(address);
    self.url = ko.observable(url);
    self.description = ko.observable(description);
    self.image = ko.observable(image);
    self.displayFlag = ko.observable(ko.computed(function() {
        return (self.description()||self.url()||self.image()||self.address());
    }, this));
}

function ViewListElement(name, marker) {
    var self = this;
    self.name = ko.observable(name);
    self.marker = ko.observable(marker);
    self.detail = ko.observable(new detailModel(null,null,null,null));
    self.detailFlag = ko.observable(false);
    self.detailExisit = ko.observable(false);
    self.showDetails = function() {
        self.detailFlag(!self.detailFlag());
        // not find yet.
        if(self.detailExisit() == false) {
            console.log('need to fetch from four squard');
            // get avenue id 
            // get detail
            getVenuesId(self);

        }
        // have already found. things go as before.
        else {
            console.log('already found');
        }
    };
    self.setMarker = function() {
        self.marker().setAnimation(google.maps.Animation.BOUNCE);
    };
    self.resetMarker = function() {
        self.marker().setAnimation(null);
    };
}

function APIViewModel() {
    var self = this;
    self.ViewArray = ko.observableArray();
    self.typeArray = ko.observableArray();
    self.SearchingParameter = ko.observable(new SearchModel('', 0, 2000, '', ''));
    self.getViewArray = function() {
        return self.ViewArray;
    };
    self.pushViewArray = function(name, marker) {
        var element = new ViewListElement(name, marker);
        self.getViewArray().push(element);
    };
    self.clearList = function() {
        self.ViewArray([]);
    };
    self.initTypeArray = function() {
        for(var i = 0; i < Types.length; i++) {
            self.typeArray.push(new optionModel(i, Types[i]));
        }
    };
}

function getVenuesId(self) {
    var pos = self.marker().position;
    var lat = pos.lat();
    var lng = pos.lng();
    var searchVenues = venuesHeader+
                       'search?client_id='+
                       client_id+
                       '&client_secret='+
                       client_secret+
                       '&v=20180323'+
                       '&ll='+lat+','+lng+
                       '&query='+self.marker().title+
                       '&limit=1';
    var res = encodeURI(searchVenues);
    console.log(res);
    $.ajax({ 
        type: 'GET',
        url: res,
        dataType: 'json',
        success: function (data) {
            if(data['response']['venues'].length==0) {
                console.log("no results found");
            }
            else {
                if (data['response']['venues'][0]['id']!=null) {
                    var id = data['response']['venues'][0]['id'];
                    getVenuesDetail(self, id);
                }
                else {
                    console.log("no id found");
                }
            }
        },
        error: function (xhr, ajaxOptions, thrownError) {
            if (status == 'timeout') {
                // timeout -> reload the page and try again
                console.log('timeout');
                window.location.reload();
            } else {
                // another error occured  
                alert('error: ' + xhr + ajaxOptions + thrownError);
            }
        }
    });
}

function getVenuesDetail(self, id) {
    var searchUrl = venuesHeader+
                    id+
                    '?client_id='+
                    client_id+
                    '&client_secret='+
                    client_secret+
                    '&v=20180323';
    console.log(searchUrl);
    $.ajax({ 
        type: 'GET',
        url: searchUrl,
        dataType: 'json',
        success: function (data) {
            console.log('detail');
            console.log(data);
            var venue = data['response']['venue'];
            var address = venue['location']['formattedAddress'];
            var url = venue['url'];
            var description = venue['description'];
            var image = venue['bestPhoto']['prefix']+'300x300'+venue['bestPhoto']['suffix'];
            console.log(address);
            console.log(url);
            console.log(description);
            console.log(image);
            self.detail(new detailModel(address, url, description, image));
            self.detailExisit(true);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            if (status == 'timeout') {
                // timeout -> reload the page and try again
                console.log('timeout');
                window.location.reload();
            } else {
                // another error occured  
                alert('error: ' + xhr + ajaxOptions + thrownError);
            }
        }
    });
}

viewModel.initTypeArray();
