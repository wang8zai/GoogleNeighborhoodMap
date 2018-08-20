var viewModel = new APIViewModel();
var Types = ['library', 'restaurant', 'store','bank','museum','bar'];
var venuesHeader = 'https://api.foursquare.com/v2/venues/';
var client_id = 'P5MTQTPUXEAD1FEEU2OJ52ANWUKKBG2TMOWGPR4FNGCLZLEC';
var client_secret = 'TUTJJSHCLWMZ3OGFOXI4UIO3DBEJMJRVP1TDASVRZCGBSA3P';
// search model. mainly store the searching parameters.
// mode is the type of the place like what in Types.
function SearchModel(location, mode, radius, filter, pos) {
    var self = this;
    self.location = ko.observable(location);
    self.mode = ko.observable(mode);
    self.radius = ko.observable(radius);
    self.filter = ko.observable(filter);
    self.CurrentPosition = ko.observable(pos);
}

// option model. a helper for Types.
function optionModel(id,name){
    var self = this;
    self.id = ko.observable(id);
    self.name = ko.observable(name);
}

// detail model. inside each arrayElement
// holds detail from foursquare.
function detailModel(name, address, url, description, image) {
    var self = this;
    self.name = ko.observable(name);
    self.address = ko.observableArray(address);
    self.url = ko.observable(url);
    self.description = ko.observable(description);
    self.image = ko.observable(image);
}

// view list element model.
// mainly used to hold marker, infowindow and detail.
function ViewListElement(name, marker, info, map) {
    var self = this;
    self.name = ko.observable(name);
    self.marker = ko.observable(marker);
    self.info = ko.observable(info);
    self.map = ko.observable(map);
    self.detail = ko.observable(new detailModel(null,null,null,null,null));
    // searched Flag means searched or not.
    self.searchedFlag = ko.observable(false);
    // display Flag means display or not.
    self.displayFlag = ko.observable(false);
    // results Flag means results exisits or not.
    self.resultFlag = ko.observable(false);
    self.showDetails = function() {
        self.displayFlag(true);
        // not find yet.
        if(self.searchedFlag() == false) {
            console.log('need to fetch from four squard');
            // get avenue id
            // get detail
            getVenuesId(self);
            self.searchedFlag(true);
        }
        // have already found. things go as before.
        else {
            console.log('have already searched');
        }
        self.info().setMap(self.map());
    };
    self.setMarker = function() {
        self.marker().setAnimation(google.maps.Animation.BOUNCE);
    };
    self.resetMarker = function() {
        self.marker().setAnimation(null);
    };
}

// api view model. main model.
// hold all infomation in this view model.
function APIViewModel() {
    var self = this;
    self.ViewArray = ko.observableArray();
    self.typeArray = ko.observableArray();
    self.selected = ko.observable(null);
    self.map = ko.observable(null);
    self.SearchingParameter = ko.observable(new SearchModel('', 'restaurant', 3000, '', ''));
    self.setMap = function(map) {
        self.map(map);
    };
    self.getViewArray = function() {
        return self.ViewArray;
    };
    self.pushViewArray = function(name, marker, info) {

        // marker.setAttribute('data-bind', '\'click: $parent.showDetails()\'');
        var element = new ViewListElement(name, marker, info, self.map());
        marker.addListener('click', self.clearView);
        marker.addListener('click', element.showDetails);
        // element.marker().addListener('click', element.showDetails());
        self.getViewArray().push(element);
    };
    self.clearView = function() {
        var va = self.ViewArray();
        for(var i=0; i<va.length; i++) {
            va[i].displayFlag(false);
            va[i].info().setMap(null);
            va[i].marker().setAnimation(null);
        }
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

// 3rd party API foursquare
// helper function to get data from foursquare.
function getVenuesId(self) {
    var pos = self.marker().position;
    var lat = pos.lat();
    var lng = pos.lng();
    // build endpoint url
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
    // send request.
    $.ajax({ 
        type: 'GET',
        url: res,
        dataType: 'json',
        success: function (data) {
            if(data['response']['venues'].length==0) {
                console.log('no results found');
            }
            else {
                if (data['response']['venues'].length>0) {
                    var address = data['response']['venues'][0]['location']['formattedAddress'];
                    var name = data['response']['venues'][0]['name'];
                    console.log(address);
                    console.log(name);
                    self.info().setContent(name);
                    self.detail(new detailModel(name, address, null, null, null, true));
                    self.resultFlag(true);
                }
                else {
                    console.log('no id found');
                    self.resultFlag(false);
                }
            }
        },
        // handle error. if error alert.
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
//init model.
viewModel.initTypeArray();
