var map;
var geocoder;
var bikeIcon = "img/atv.png";
var homeIcon = "img/home-2.png";
var hospIcon = "img/hospital-building.png";
var pinIcon = "img/pin.png";
var changeoverIcon = "img/group-2.png";
var poiIcon = "img/group-2.png";
var unknownIcon = "img/quesPin.png";
var pois = new Array();
var weatherVisible = false;
var weatherLayer;
var trafficVisible = false;
var trafficLayer;

$(function() 
{
	$("#loading").slideUp();
	$("#entry").slideDown();
	initialize();
});

function initialize() 
{
	geocoder = new google.maps.Geocoder();
	var mapOptions = {
		center: new google.maps.LatLng(51.501974479325135,-0.13295898437502274),
		zoom: 10,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
	trafficLayer = new google.maps.TrafficLayer();
	weatherLayer = new google.maps.weather.WeatherLayer({
		temperatureUnits: google.maps.weather.TemperatureUnit.CELSIUS
	});
	initDialogues();
	window.setTimeout("keepAlive()", 20000);
	showLocations();
}

function initDialogues()
{
	$("#routeDialog").dialog({
		width:550,
		show: { effect: "clip", duration: 200 },
		hide: { effect: "clip", duration: 200 },
		autoOpen: false
	});
	$("#controllerLog").dialog({
		width:850,
		show: { effect: "clip", duration: 200 },
		hide: { effect: "clip", duration: 200 },
		autoOpen: false,
	});
	$("#locationsList").dialog({
		width:850,
		show: { effect: "clip", duration: 200 },
		hide: { effect: "clip", duration: 200 },
		autoOpen: false
	});
	$("#memberList").dialog({
		width:850,
		show: { effect: "clip", duration: 200 },
		hide: { effect: "clip", duration: 200 },
		autoOpen: false
	});
}

function keepAlive()
{
	callServerSide(
		"Service/Service.asmx/KeepAlive", 
		"{}",
		function(json)
		{
			window.setTimeout("keepAlive()", 20000);
		},
		null
	);
}

function showMembers()
{
	$("#lnkShowMembers").hide();
	callServerSide(
		"Service/Service.asmx/SearchMembers", 
		"{'search':'', 'onlyActive':1}",
		function(json)
		{
			for(var x = 0; x < json.d.length; x++)
			{
				if (json.d[x].PostCode != "" )
				{
					var pcode = json.d[x].PostCode.replace(/ /g,'');
					window.setTimeout("geocode('" + pcode + "')", x * 400);

				}
			}
		},
		function()
		{
		}
	);
}

function showHideWeather()
{
	if (weatherVisible)
	{
		weatherLayer.setMap(null);
	}
	else
	{
		weatherLayer.setMap(map);
	}
	weatherVisible = !weatherVisible;
}

function showHideTraffic()
{
	if (trafficVisible)
	{
		trafficLayer.setMap(null);
	}
	else
	{
		trafficLayer.setMap(map);
	}
	trafficVisible = !trafficVisible;
}

function showLoadRouteFile()
{
	$("#routeDialog").dialog("open");
}

function showControllerLog()
{
	$("#controllerLog").dialog("open");
}

function loadRouteFile()
{
	wayPointMarkers = new Array();
	wayPoints = new Array();
	var route = $("#txtRoute").val();
	var lines = route.split("\n");
	for (var x = 0; x < lines.length; x++)
	{
		var line = lines[x].trim();
		if (line != "")
		{
			var bits = line.split("|");
			if (bits.length>1)
			{
				var lat = "00000000" + bits[1];
				var ln = "00000000" + bits[0];
				lat = lat.replace("-","");
				ln = ln.replace("-","");
				lat = lat.replace("+","");
				ln = ln.replace("+","");
				lat = lat.substring(0,lat.length -5) + "." + lat.substring(lat.length -5);
				ln = ln.substring(0,ln.length -5) + "." + ln.substring(ln.length -5);
				if (bits[1].substring(0,1) == '-') { lat = "-" + lat; }
				if (bits[0].substring(0,1) == '-') { ln = "-" + ln; }
				var latLon = new google.maps.LatLng(lat, ln);
				var marker = new google.maps.Marker({
					position: latLon,
					icon: pinIcon,
					draggable: false,
					title:bits[2],
					map: map,
					animation: google.maps.Animation.DROP
				});
				wayPoints[wayPoints.length] = latLon;
				wayPointMarkers[wayPointMarkers.length] = marker;
			}
		}
	}
	var route = new google.maps.Polyline({
		path: wayPoints,
		strokeColor: "#FF0000",
		strokeOpacity: 1.0,
		strokeWeight: 2
	});
	route.setMap(map);
	$("#routeDialog").dialog("close");
}

function geocode(postCode) 
{
	geocoder.geocode(
		{
			'address': postCode,
			'partialmatch': true
		}, 
		geocodeResult
	);
}

function geocodeResult(results, status) 
{
	if (status == 'OK' && results.length > 0) 
	{
		addDraggableMarker(results[0].geometry.location, "Member", bikeIcon);
	}
}

function showLocations()
{
	callServerSide(
		"Service/Service.asmx/ListLocations", 
		"{}",
		function(json)
		{
			for(var x = 0; x < json.d.length; x++)
			{
				if (json.d[x].Lat != "" && json.d[x].Lat != null && json.d[x].Lng != "" && json.d[x].Lng != null)
				{
					if (json.d[x].Hospital)
					{
						addMarker(new google.maps.LatLng(json.d[x].Lat, json.d[x].Lng), json.d[x].LocationName + " (Hospital)", hospIcon);
					}
					else if (json.d[x].Changeover)
					{
						addMarker(new google.maps.LatLng(json.d[x].Lat, json.d[x].Lng), json.d[x].LocationName + " (Handover)", changeoverIcon);
					}
					else if (json.d[x].BloodBank)
					{
						addMarker(new google.maps.LatLng(json.d[x].Lat, json.d[x].Lng), json.d[x].LocationName + " (Bloodbank)", hospIcon);
					}
					else
					{
						addMarker(new google.maps.LatLng(json.d[x].Lat, json.d[x].Lng), json.d[x].LocationName, unknownIcon);
					}
				}
			}
		},
		function()
		{
		}
	);
}

function addDraggableMarker(latLon, name, icon)
{
	var marker = new google.maps.Marker({
		position: latLon,
		draggable: true,
		title:name,
		map: map,
		icon: icon
	});
	//pois[pois.length] = marker;
}

function addMarker(latLon, name, icon)
{
	var marker = new google.maps.Marker({
		position: latLon,
		draggable: false,
		title:name,
		map: map,
		icon: icon
	});
	//pois[pois.length] = marker;
}

function niceAlert(msg)
{
	$("#alertMessage").text(msg);
	$("#alert").dialog({
		modal: true,
		dialogClass: "no-close",
		autoOpen: true,
		show: { effect: "shake", duration: 100 },
		hide: { effect: "slide", duration: 100 },
		buttons: 
		[
			{
			  text: "OK",
			  click: function() {
			    $( this ).dialog( "close" );
			  }
			}
		]
	});
}

function callServerSide(url, data, success, error)
{
	$.ajax({
		type: "POST",
		url: url,
		data: data,
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: success,
		error: error
	});
}