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

//pulling in the secret sauce
var fileName = 'geodata.json';
var file = Titanium.Filesystem.getFile(Titanium.Filesystem.resourcesDirectory, fileName);
var json = file.read();
var geodata = (JSON.parse(json));

//using alien technology to figure out where the device is
Titanium.Geolocation.purpose = "To identify user location for relevant local emergency services numbers";
Titanium.Geolocation.accuracy = Titanium.Geolocation.ACCURACY_BEST;
Titanium.Geolocation.distanceFilter = 10;

var longitude;
var latitude;

Titanium.Geolocation.getCurrentPosition(function(e) {
    if (e.error) {//user alert if GPS is off
        alert('Global911 cannot get your current location. Please enable GPS Services (GPS Services do not use mobile or roaming data)');
        return;
    }
    else {//if GPS is on, set lat and long from device GPS
        longitude = e.coords.longitude;
        latitude = e.coords.latitude;
    };
});

if (Titanium.Network.networkType == Titanium.Network.NETWORK_NONE) {//offline reverse geocoding
	//label with offline notice TODO: should i keep this?
	var offlineLabel = Titanium.UI.createLabel({
		text:"Working Offline",
		bottom:0,
		height:"5%",
		width:"90%",
		font:{fontSize:18}
	});
	win.add(offlineLabel);
	var pole = [90,0000,0.0000];//using the North Pole as the other end of the test segment. Sorry, Santa
	var found = null;
	//gonna do a science and use the Jordan Curve Theorem here, you might want to shield your eyes
	while (found = null) {//when the correct country is found, the geodata key will be stored in found, so we can stop searching
		var i = 0; //counting through main geodata array (countries)
		if (geodata[i].geometry.type === "Polygon"){//testing cases where the country is a single contiguous polygon
			var intersect = 0; //number of times a segment consisting of the user & the North Pole intersects with a segment consisting of two adjacent country vertices
			var vertices = geodata[i].geometry.coordinates.length; //grabbing the number of vertices a country has
			var j; //counting through coordinates array for current country
			for (j = 0; j < vertices; j++) {
				//boring stuff to separate out the latitudes and longitudes that we're gonna test this time around
				if ((j+1) = vertices){//if the vertice we're testing is the same number in the list as the total amount of vertices, then it's the last one and we have to compare against the first vertice in the list
					var vert1 = geodata[i].geometry.coordinates[j];//taking the last vertices
					var vert2 = geodata[i].geometry.coordinates[0];//taking the first vertices
				}
				else {
					var vert1 = geodata[i].geometry.coordinates[j];
					var vert2 = geodata[i].geometry.coordinates[j+1];
				}
				var res = vert1.split();
				var res1 = vert2.split();
				var lat, lon;//variables to hold the two latitudes and longitudes for the test vertices
				lat.push(res[1]);
				lat.push(res1[1]);
				lon.push(res[0]);
				lon.push(res1[0]);
				//finally, we can get to testing the specific segment formed by the vertices we're looking at right now
				if ((lon[0] < longitude && longitude < lon[1]) || (lon[0] > longitude && longitude >  lon[1])) {
					var t = (longitude - lon[1]) / (lon[0] - lon[1]);
					var cy = t * lat[0] + (1-t) * lat[1];
					if (latitude == cy) found = i;//point is on border
					else if (latitude > cy) intersect++;
				}
				if (lon[0] == longitude && lat[0] <= latitude) {
					if (lat[0] == latitude) found = i;//point is on border
					if (lon[1] == longitude) {
						if ((lat[0] <= latitude && latitude <= lat[1]) || (lat[0] >= latitude && latitude >= lat[1])) intersect = intersect;
						else if (lon[1] > longitude) intersect++;
					if (lon[-1] > longitude) intersect++;//TODO: something's wrong here, I did something wrong. Should I load up all the vertices in the new array?
					}
				}
			}
			if (intersect%2 == 0) found = i;
		}
		else if (geodata[i].geometry.type === "MultiPolygon"){//testing cases where the country is multiple polygons or has multiple discrete parts
			var n = geodata[i].geometry.coordinates.length; //get length of coordinates array, which will now be the number of polygons in the array
			var m;
			for (m = 0; m < n; m++) {
				var intersect = 0; //number of times a segment consisting of the user & the North Pole intersects with a segment consisting of two adjacent country vertices
				var vertices = geodata[i].geometry.coordinates.length; //grabbing the number of vertices a country has
				var j; //counting through coordinates array for current country
				for (j = 0; j < vertices; j++) {
					//boring stuff to separate out the latitudes and longitudes that we're gonna test this time around
					if ((j+1) = vertices){//if the vertice we're testing is the same number in the list as the total amount of vertices, then it's the last one and we have to compare against the first vertice in the list
						var vert1 = geodata[i].geometry.coordinates[m][j];//taking the last vertices
						var vert2 = geodata[i].geometry.coordinates[0];//taking the first vertices
					}
					else {
						var vert1 = geodata[i].geometry.coordinates[m][j];
						var vert2 = geodata[i].geometry.coordinates[m][j+1];
					}
					var res = vert1.split();
					var res1 = vert2.split();
					var lat, lon;//variables to hold the two latitudes and longitudes for the test vertices
					lat.push(res[1]);
					lat.push(res1[1]);
					lon.push(res[0]);
					lon.push(res1[0]);
					//finally, we can get to testing the specific segment formed by the vertices we're looking at right now
					if ((lon[0] < longitude && longitude < lon[1]) || (lon[0] > longitude && longitude >  lon[1])) {
						var t = (longitude - lon[1]) / (lon[0] - lon[1]);
						var cy = t * lat[0] + (1-t) * lat[1];
						if (latitude == cy) found = i;//point is on border
						else if (latitude > cy) intersect++;
					}
					if (lon[0] == longitude && lat[0] <= latitude) {
						if (lat[0] == latitude) found = i;//point is on border
						if (lon[1] == longitude) {
							if ((lat[0] <= latitude && latitude <= lat[1]) || (lat[0] >= latitude && latitude >= lat[1])) intersect = intersect;
							else if (lon[1] > longitude) intersect++;
						if (lon[-1] > longitude) intersect++;//TODO: something's wrong here, I did something wrong. Should I load up all the vertices in the new array?
						}
					}
				}
				if (intersect%2 != 0) found = i;
			}
		}
	}
	//Display Device Current Country
		var locationLabel = Titanium.UI.createLabel({
			text:geodata[1].geometry.coordinates,
			top:"10%",
			height:"90%",
			width:"90%",
			font:{fontSize:18}
		});
		win.add(locationLabel);
}
else {//online reverse  geocoding
	var country_code;
	var countryID;

	Titanium.Geolocation.reverseGeocoder(latitude,longitude, function(evt) {//this part is just magic, I don't know how it works, but it does
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
		//country_code and country, and countryID works here
		//Display Device Current Country
			var locationLabel = Titanium.UI.createLabel({
				text:("Your Location: " + country /*latitude + ", " + longitude*/),
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
			win.add(locationLabel);
			win.add(numberDial);
	});
}// end of else

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
	//win.add(locationLabel);
}

win.open();