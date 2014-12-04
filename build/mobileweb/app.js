var win = Titanium.UI.createWindow({
	title:"Global911",
	backgroundColor:"#FFF",
	exitOnClose:true
});

//top Brand Label
var brandLabel = Titanium.UI.createLabel({
	text:"Global911",
	color: "white",
	backgroundColor:"#e0483e",
	top:0,
	height:"10%",
	width:"100%",
	textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
	font:{fontSize:24}
});

//get geodata file and set to array
var fileName = 'geodata.json';
var file = Titanium.Filesystem.getFile(Titanium.Filesystem.resourcesDirectory, fileName);
var json = file.read();
var geodata = (JSON.parse(json));

//get Device Location
Titanium.Geolocation.purpose = "To identify user location for relevant local emergency services numbers";
Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
Titanium.Geolocation.distanceFilter = 10;

var longitude;
var latitude;

Titanium.Geolocation.getCurrentPosition(function(e) {
    if (e.error) {
        alert('Global911 cannot get your current location. Please enable GPS Services (GPS Services do not use mobile or roaming data)');
        return;
    }
    else {
        longitude = e.coords.longitude;
        latitude = e.coords.latitude;
    };
});

if (Titanium.Network.networkType == Titanium.Network.NETWORK_NONE) {
	//do offline reverse geocoding here
}
else {
	//do network reverse geocoding here
}

//Display Device Current Country
var locationLabel = Titanium.UI.createLabel({
	text:("Your Location: " + latitude + ", " + longitude),
	top:"10%",
	height:"5%",
	width:"90%",
	font:{fontSize:18}
});

//Display Notice if No GPS
var noGPSLabel = Titanium.UI.createLabel({
	text:("Global911 cannot retrieve your GPS location"),
	top:"10%",
	height:"10%",
	width:"90%",
	font:{fontSize:18}
});

//displaying stuff
win.add(brandLabel);
if (latitude == undefined){
	win.add(noGPSLabel);
}
else {
	win.add(locationLabel);
}


/*

// try to get address
var country_code;
var countryID;

Titanium.Geolocation.reverseGeocoder(latitude,longitude, function(evt) {
    if (evt.success) {
        var places = evt.places;
        if (places && places.length) {
            country_code = places[0].country_code;
        }
        else {
            country_code = "No country found";
        }
    }
    
	// get country name from country code
	countryID = countryName(country_code);

	function countryName(country_code) {
	    var i = 0;
	    while (geodata[i]) {
		    if (geodata[i].id === country_code) {
			    country = geodata[i].name;
			    return i;
			}
		    i++;
		}
	    country = "Country Not Found";
	    return country;
	}
    
	//display users current country 
	var locationLabel = Titanium.UI.createLabel({
		text:("Your Location: " + geodata[countryID].name),
		top:"10%",
		height:"5%",
		width:"90%",
		font:{fontSize:18}
	});
	var numberLabel = Titanium.UI.createLabel({
		text:"Your Local Emergency Number: " + geodata[countryID].number,
		top:"30%",
		height:"5%",
		width:"90%",
		font:{fontSize:18}
	});
	var numberDial = Titanium.UI.createButton({
		title:"DIAL " + geodata[countryID].number,
		width:"32%",
		height:"10%",
		top:"36%",
		borderRadius: "10",
		borderColor: "blue",
	});

	//sends user to dialer with emergency number pre-populated when numberDial is clicked
	numberDial.addEventListener("click", function(e){
		{Titanium.Platform.openURL("tel:"+geodata[countryID].number);}
	});

	win.add(numberLabel);
	win.add(numberDial);
	win.add(locationLabel);
	 return countryID;
     });


//var coCode = evt();

var updateLocation = Titanium.UI.createButton({
	title:"Update Location", // TODO: need to make this actually work - add an event listener to trigger fresh GPS coordinates
	width:"45%",
	height:"10%",
	top:"16%",
	borderRadius: "10",
	borderColor: "blue",
	id:"Update Location"
});

// language warning
var languageLabel = Titanium.UI.createLabel({
	text:"NOTE: Local emergency services may not speak English or your primary language.",
	top:"47%",
	height:"15%",
	width:"90%",
	font:{fontSize:18}
});

// display all the things!! except the country, of course, that's already displayed
win.add(updateLocation);
win.add(languageLabel);

*/

win.open();