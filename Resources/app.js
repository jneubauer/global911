var win = Titanium.UI.createWindow({
	title:"Global911",
	backgroundColor:"#e6e8e6",
	exitOnClose:true
});

//top Brand Label
var brandLabel = Titanium.UI.createLabel({
	backgroundColor:"#102E4A",
	top:0,
	height:80,
	width:"100%",
});
var brandImg = Titanium.UI.createImageView({
	image:"global911-mini.png",
	top:25,
	height:45,
});
if (Ti.Platform.osname !== 'android') {
	win.add(brandLabel);
	win.add(brandImg);
}

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

if (latitude !== undefined) {
	if (Titanium.Network.networkType == Titanium.Network.NETWORK_NONE) {//offline reverse geocoding
	//label with offline notice TODO: should i keep this?
	var offlineLabel = Titanium.UI.createLabel({
		text:"Global911 is Working Offline",
		backgroundColor:"#102E4A",
		color: "#fff",
		bottom:0,
		height:'auto',
		padding: 15,
		width:"100%",
		font:{fontSize:14}
	});
	win.add(offlineLabel);
	//gonna do a science and use the Jordan Curve Theorem here, you might want to shield your eyes
	var intersects = null;
	var found = null;
	//verified block for looping through countries and deciding if polygon or multi polygon
	for (var i = 0; i < geodata.length; i++){
		if (geodata[i].geometry.type == "Polygon"){
			//verified for testing country that is a single polygon
			for (var j = 0; j < geodata[i].geometry.coordinates[0].length; j++) {
				var x1, x2, x3, x4, y1, y2, y3, y4;
				x1 = 90.0000;
				y1 = 0.0000;
				x2 = latitude;
				y2 = longitude;
				if ((j+1) == geodata[i].geometry.coordinates[0].length) {
					x3 = geodata[i].geometry.coordinates[0][j][1];
					y3 = geodata[i].geometry.coordinates[0][j][0];
					x4 = geodata[i].geometry.coordinates[0][0][1];
					y4 = geodata[i].geometry.coordinates[0][0][0];
				} else {
					x3 = geodata[i].geometry.coordinates[0][j][1];
					y3 = geodata[i].geometry.coordinates[0][j][0];
					x4 = geodata[i].geometry.coordinates[0][j+1][1];
					y4 = geodata[i].geometry.coordinates[0][j+1][0];
				}
				
				function line_intersects(x1, y1, x2, y2, x3, y3, x4, y4) {
				 
				    var s1_x, s1_y, s2_x, s2_y;
				    s1_x = x2 - x1;
				    s1_y = y2 - y1;
				    s2_x = x4 - x3;
				    s2_y = y4 - y3;
				 
				    var s, t;
				    s = (-s1_y * (x1 - x3) + s1_x * (y1 - y3)) / (-s2_x * s1_y + s1_x * s2_y);
				    t = ( s2_x * (y1 - y3) - s2_y * (x1 - x3)) / (-s2_x * s1_y + s1_x * s2_y);
				 
				    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) intersects++;
				
				};
				line_intersects(x1, y1, x2, y2, x3, y3, x4, y4);
			};
			if (intersects > 0 && intersects%2 != 0) found = i;
		}
		if (found != null) break;
		if (geodata[i].geometry.type == "MultiPolygon"){
			//verified for testing country that is a multi polygon
			for (var k = 0; k < geodata[i].geometry.coordinates.length; k++) {
				for (var l = 0; l < geodata[i].geometry.coordinates[k][0].length; l++) {
					var x1, x2, x3, x4, y1, y2, y3, y4;
					x1 = 90.0000;
					y1 = 0.0000;
					x2 = latitude;
					y2 = longitude;
					if ((l+1) == geodata[i].geometry.coordinates[k][0].length) {
						x3 = geodata[i].geometry.coordinates[k][0][l][1];
						y3 = geodata[i].geometry.coordinates[k][0][l][0];
						x4 = geodata[i].geometry.coordinates[k][0][0][1];
						y4 = geodata[i].geometry.coordinates[k][0][0][0];
					} else {
						x3 = geodata[i].geometry.coordinates[k][0][l][1];
						y3 = geodata[i].geometry.coordinates[k][0][l][0];
						x4 = geodata[i].geometry.coordinates[k][0][l+1][1];
						y4 = geodata[i].geometry.coordinates[k][0][l+1][0];
					}
					function line_intersects(x1, y1, x2, y2, x3, y3, x4, y4) {
				 
					    var s1_x, s1_y, s2_x, s2_y;
					    s1_x = x2 - x1;
					    s1_y = y2 - y1;
					    s2_x = x4 - x3;
					    s2_y = y4 - y3;
					 
					    var s, t;
					    s = (-s1_y * (x1 - x3) + s1_x * (y1 - y3)) / (-s2_x * s1_y + s1_x * s2_y);
					    t = ( s2_x * (y1 - y3) - s2_y * (x1 - x3)) / (-s2_x * s1_y + s1_x * s2_y);
					 
					    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) intersects++;
					
					};
					line_intersects(x1, y1, x2, y2, x3, y3, x4, y4);
				}
				if (intersects > 0 && intersects%2 != 0) {
					found = i;
					break;
				}
			};
		}
		if (found != null) break;
	}
	
	//Display Device Current Country
	var locationLabel = Titanium.UI.createLabel({
		text:("Your Location: " + geodata[found].name),
		color: "#272727",
		top:90,
		height:60,
		width:"90%",
		font:{fontSize:18}
	});
	var numberLabel = Titanium.UI.createLabel({
		text:"Available Emergency Numbers: ",
		color: "#272727",
		top:160,
		height:20,
		width:"90%",
		font:{fontSize:18}
	});
	var policeButton = Titanium.UI.createButton({
		title: "Police: Dial " + geodata[found].number[0],
		backgroundColor: "#2aabe1",
		color: "#fff",
		borderRadius: 8,
		top:200,
		height:'auto', 
		width:"60%",
		padding: 15,
		font:{fontSize:18, fontWeight: "bold"}
	});
	var ambulanceButton = Titanium.UI.createButton({
		title: "Ambulance: Dial " + geodata[found].number[1],
		backgroundColor: "#2aabe1",
		color: "#fff",
		borderRadius: 8,
		top:260,
		height:'auto', 
		width:"60%",
		padding: 15,
		font:{fontSize:18, fontWeight: "bold"}
	});
	var fireButton = Titanium.UI.createButton({
		title: "Fire: Dial " + geodata[found].number[2],
		backgroundColor: "#2aabe1",
		color: "#fff",
		borderRadius: 8,
		top:320,
		height:'auto',
		padding: 15,
		width:'60%',
		font:{fontSize:18, fontWeight: "bold"}
	});
	var noOptions = Titanium.UI.createLabel({
		text: "There are no known emergency numbers for the country you are in.",
		color: "#272727",
		top:200,
		height:40, 
		width:"90%",
		font:{fontSize:18}
	});
	var singleNumber = Titanium.UI.createButton({
		title: "Dial " + geodata[found].number,
		backgroundColor: "#2aabe1",
		color: "#fff",
		borderRadius: 8,
		top:200,
		height:'auto', 
		width:"60%",
		padding: 15,
		font:{fontSize:18, fontWeight: "bold"}
	});
	
	var options = 0;
	
	if (geodata[found].number.length == 1) {
		if (geodata[found].number[0] != "") win.add(singleNumber);
		options++;
	}
	else {
		for (var p = 0; p < geodata[found].number.length; p++){
			if (p == 0 && geodata[found].number[p] != "") {
				win.add(policeButton);
				options++;
			}
			if (p == 1 && geodata[found].number[p] != "") {
				win.add(ambulanceButton);
				options++;
			}
			if (p == 2 && geodata[found].number[p] != "") {
				win.add(fireButton);
				options++;
			}
		}
	}
	if (options == 0) win.add(noOptions);
	//sends user to dialer with emergency number pre-populated when numberDial is clicked
	policeButton.addEventListener("click", function(e){
		{Titanium.Platform.openURL("tel:"+ geodata[found].number[0]);}
	});
	ambulanceButton.addEventListener("click", function(e){
		{Titanium.Platform.openURL("tel:"+ geodata[found].number[1]);}
	});
	fireButton.addEventListener("click", function(e){
		{Titanium.Platform.openURL("tel:"+ geodata[found].number[2]);}
	});
	singleNumber.addEventListener("click", function(e){
		{Titanium.Platform.openURL("tel:"+ geodata[found].number);}
	});

	win.add(locationLabel);
	win.add(numberLabel);
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
				text:("Your Location: " + country),
				color: "#272727",
				top:90,
				height:60,
				width:"90%",
				font:{fontSize:18}
			});
			var numberLabel = Titanium.UI.createLabel({
				text:"Available Emergency Numbers",
				color: "#272727",
				top:160,
				height:20,
				width:"90%",
				font:{fontSize:18}
			});
			var policeButton = Titanium.UI.createButton({
				title: "Police: Dial " + geodata[countryID].number[0],
				backgroundColor: "#2aabe1",
				color: "#fff",
				borderRadius: 8,
				top:200,
				height:'auto', 
				width:"60%",
				padding: 15,
				font:{fontSize:18, fontWeight: "bold"}
			});
			var ambulanceButton = Titanium.UI.createButton({
				title: "Ambulance: Dial " + geodata[countryID].number[1],
				backgroundColor: "#2aabe1",
				color: "#fff",
				borderRadius: 8,
				top:260,
				height:'auto', 
				width:"60%",
				padding: 15,
				font:{fontSize:18, fontWeight: "bold"}
			});
			var fireButton = Titanium.UI.createButton({
				title: "Fire: Dial " + geodata[countryID].number[2],
				backgroundColor: "#2aabe1",
				color: "#fff",
				borderRadius: 8,
				top:320,
				height:'auto',
				padding: 15,
				width:'60%',
				font:{fontSize:18, fontWeight: "bold"}
			});
			var noOptions = Titanium.UI.createLabel({
				text: "There are no known emergency numbers for the country you are in.",
				color: "#272727",
				top:200,
				height:40, 
				width:"90%",
				font:{fontSize:18}
			});
			var singleNumber = Titanium.UI.createLabel({
				text: "Dial " + geodata[countryID].number,
				backgroundColor: "#2aabe1",
				color: "#fff",
				borderRadius: 8,
				top:200,
				height:'auto', 
				width:"60%",
				padding: 15,
				font:{fontSize:18, fontWeight: "bold"}
			});
			
			var options = 0;
			
			if (geodata[countryID].number.length == 1) {
				if (geodata[countryID].number[0] != "") {
					win.add(singleNumber);
					options++;
				}
			}
			else {
				for (var p = 0; p < geodata[countryID].number.length; p++){
					if (p == 0 && geodata[countryID].number[p] != "") {
						win.add(policeButton);
						options++;
					}
					if (p == 1 && geodata[countryID].number[p] != "") {
						win.add(ambulanceButton);
						options++;
					}
					if (p == 2 && geodata[countryID].number[p] != "") {
						win.add(fireButton);
						options++;
					}
				}
			}
			if (options == 0) win.add(noOptions);
			//sends user to dialer with emergency number pre-populated when numberDial is clicked
			policeButton.addEventListener("click", function(e){
				{Titanium.Platform.openURL("tel:"+ geodata[countryID].number[0]);}
			});
			ambulanceButton.addEventListener("click", function(e){
				{Titanium.Platform.openURL("tel:"+ geodata[countryID].number[1]);}
			});
			fireButton.addEventListener("click", function(e){
				{Titanium.Platform.openURL("tel:"+ geodata[countryID].number[2]);}
			});
			singleNumber.addEventListener("click", function(e){
				{Titanium.Platform.openURL("tel:"+ geodata[countryID].number);}
			});
			win.add(numberLabel);
			win.add(locationLabel);
	});
}// end of else
	
}

//Display Notice if No GPS
var noGPSLabel = Titanium.UI.createLabel({
	text:("Global911 cannot retrieve your GPS location"),
	color: "#272727",
	top:90,
	height:60,
	width:"90%",
	font:{fontSize:18}
});

//displaying stuff

if (latitude == undefined){
	win.add(noGPSLabel);
}
else {
	//win.add(locationLabel);
}

win.open();