// Controller logging support js

// Product type constants
var BLOOD			= 1;
var PLATELETS		= 2;
var PLASMA			= 3;
var SAMPLE			= 4;
var HUMAN_MILK		= 5;
var WATER_SAMPLE	= 6;
var RH1			 	= 7;
var RH2			 	= 8;
var RH3			 	= 9;
var RH4			 	= 10;
var RH5			 	= 11;
var RH6			 	= 12;
var RH7			 	= 13;
var RH8			 	= 14;
var DRUGS			= 15;
var PACKAGE			= 16;
var OTHER			= 17;

var DEFAULT_URGENCY = 2;
var MAX_URGENCY = 3;
var MIN_URGENCY = 1;

var bloodBox = 0;
var plasmaBox = 0;
var plateletsBox = 0
var sampleBox = 0;
var packageBox = 0;
var milkBox = 0;

var outBox1 = 0;
var outBox2 = 0;
var inBox1 = 0;
var inBox2 = 0;
var notCompletedPresses = 0;

var urgency = DEFAULT_URGENCY;

var runType = "";

var controllerId = 0;
var riderId = 0;
var callerLocationId = 0;
var originLocationId = 0;
var pickupLocationId = 0;
var dropLocationId = 0;
var finalLocationId = 0;
var vehicleId = 0;

var aaRiderId = 0;
var aaVehicleId = 0;

$(function() 
{
	var today = new Date();
	var tomorrow = new Date();
	tomorrow.setDate(today.getDate()+1);
	$(".date").datepicker({ dateFormat: 'dd M yy', maxDate: tomorrow });
	$( ".locations" ).autocomplete({ source: locationNames });
	$( ".controllers" ).autocomplete({ source: controllerNames });
	$( ".riders" ).autocomplete({ source: memberNames });
	asyncRequests = false;
	listControllers(null);
	listMembersWithTag("Blood,AA,Milk", null);
	listLocations(null);
	listVehicleTypes();
	showCurrentController();
	if (runLogID > 0)
	{
		LoadRunLog();
	}
	else
	{
		loaded();
		$("#entry").slideDown();
	}
	asyncRequests = true;
	keepAlive();
});

function LoadRunLog()
{
	if (runLogID > 0)
	{
		
		loading();
		$("#entry").slideUp();
		callServerSide(
			"Service/Service.asmx/GetRunLog", 
			"{'runLogID': " + runLogID + "}",
			function(json)
			{
				
				if (json.d.ControllerMemberID != currentMemberID && userLevel < 4)
				{
					$("#cmdSave").hide();
					$("#readOnlyWarn").slideDown();
				}
				else
				{
					$("#editWarn").slideDown();
				}

				jsonObj = json;
				vm = ko.mapping.fromJS(json.d)
				ko.applyBindings(vm);

				$("#txtCaller").val(getLocationName(json.d.CallFromLocationID));
				$("#txtOrigin").val(getLocationName(json.d.OriginLocationID));
				$("#txtPickup").val(getLocationName(json.d.CollectionLocationID));
				$("#txtDrop").val(getLocationName(json.d.DeliverToLocationID));
				$("#txtFinalDest").val(getLocationName(json.d.FinalDestinationLocationID));
				$("#txtController").val(getControllerName(json.d.ControllerMemberID));
				$("#txtRider").val(getMemberName(json.d.RiderMemberID));
				vehicleSelected(json.d.VehicleTypeID, json.d.Vehicle);
				for(var prod in json.d.Products)
				{
					if (prod == BLOOD) { bloodBox = json.d.Products[prod]; }
					if (prod == PLASMA) { plasmaBox = json.d.Products[prod]; }
					if (prod == PLATELETS) { plateletsBox = json.d.Products[prod]; }
					if (prod == SAMPLE) { sampleBox = json.d.Products[prod]; }
					if (prod == HUMAN_MILK) { milkBox = json.d.Products[prod]; }
					if (prod == PACKAGE) { packageBox = json.d.Products[prod]; }
				}
				updateBoxCounts();
				urgency = json.d.Urgency; 
				updateUrgency();
				
				if (!json.d.BloodRun)
				{
					niceAlert("Sorry, editing an AA run is not yet supported, you can look though!");
					$("#cmdSave").hide();
				}

				loaded();
				$("#entry").slideDown();

				showBloodPanel();
				$("#runTypeDiv").slideUp();
				$("cmdNotRun").slideUp();

			},
			function()
			{
				loaded();
				$("#error").slideDown();
				$("#entry").slideDown();
			}
		);
		window.onbeforeunload = null;
	}
}

function productCsv()
{
	var ret = "";
	if (bloodBox > 0)
	{
		for (var x = 0; x < bloodBox; x++)
		{
			ret += BLOOD + ",";
		}
	}
	if (plasmaBox > 0)
	{
		for (var x = 0; x < plasmaBox; x++)
		{
			ret += PLASMA + ",";
		}
	}
	if (plateletsBox > 0)
	{
		for (var x = 0; x < plateletsBox; x++)
		{
			ret += PLATELETS + ",";
		}
	}
	if (sampleBox > 0)
	{
		for (var x = 0; x < sampleBox; x++)
		{
			ret += SAMPLE + ",";
		}
	}
	if (packageBox > 0)
	{
		for (var x = 0; x < packageBox; x++)
		{
			ret += PACKAGE + ",";
		}
	}
	if (milkBox > 0)
	{
		for (var x = 0; x < milkBox; x++)
		{
			ret += HUMAN_MILK + ",";
		}
	}

	return ret;
}

function outCsv()
{
	var ret = "";
	if (outBox1 > 0) { ret += RH1 + (outBox1-1) + ","; }
	if (outBox2 > 0) { ret += RH1 + (outBox2-1) + ","; }
	return ret;
}	

function inCsv()
{
	var ret = "";
	if (inBox1 > 0) { ret += RH1 + (inBox1-1) + ","; }
	if (inBox2 > 0) { ret += RH1 + (inBox2-1) + ","; }
	return ret;
}

function saveRun()
{
	if (!sessionOK)
	{
		promptForLogin();
		return;
	}
	if (validate(false))
	{
		if (runType == "blood")
		{
			saveBloodRun();
		}
		if (runType == "aa")
		{
			saveAARun();
		}
		window.onbeforeunload = null;
	}
}

function saveNotRun()
{
	if (notCompletedPresses == 0)
	{
		niceAlert("You pressed 'Not Completed' if this is REALLY what you wanted, press it again.");
		notCompletedPresses ++;
		return;
	}
	if (validate(true))
	{
		if (runType == "blood")
		{
			riderId = -1;
			saveBloodRun();
		}
		window.onbeforeunload = null;
	}
}

function saveBloodRun()
{
	if (runLogID > 0)
	{
		niceAlert("Please note:  As you EDITED that run, it will be assigned a new run ID! It will no longer be run " + runLogID + ".");
	}
	var json = 
		"{" +
			"'runLogID':" + runLogID + 
			",'callDateTime':'" + $("#txtCallDate").val() + " " + formatTime($("#txtCallTime").val()) + 
			"', 'callFromLocationId':'" + callerLocationId + 
			"', 'collectDateTime':'" + $("#txtPickupDate").val() + " " + formatTime($("#txtPickupTime").val()) + 
			"', 'collectionLocationId':'" + pickupLocationId + 
			"', 'controllerMemberId':'" + controllerId + 
			"', 'deliverDateTime':'" + $("#txtDeliverDate").val() + " " + formatTime($("#txtDeliverTime").val()) + 
			"', 'deliverToLocationId':'" + dropLocationId + 
			"', 'dutyDate':'" + $("#txtShiftDate").val() + 
			"', 'finalDestinationLocationId':'" + finalLocationId + 
			"', 'originLocationId':'" + originLocationId + 
			"', 'riderMemberId':'" + riderId + 
			"', 'urgency':'" + urgency + 
			"', 'vehicleTypeId':'" + vehicleId + 
			"', 'productIdCsv':'" + productCsv() + 
			"', 'homeSafeDateTime':'" + $("#txtHomeSafeDate").val() + " " + formatTime($("#txtHomeSafeTime").val()) +
			"', 'notes':'" + $("#txtNotes").val().replace(/'/g, '') + 
			"', 'callerNumber':'" + $("#txtCallerNumber").val() + 
			"', 'callerExt':'" + $("#txtCallerExt").val() + 
		"'}";
	loading();
	$("#entry").slideUp();
	$("#error").slideUp();
	// Hit it
	callServerSide(
		"Service/Service.asmx/LogRun", 
		json,
		function(json)
		{
			loaded();
			$("#success").slideDown();
			//window.setTimeout('window.location.href="RecentRuns.aspx"', 3000);
		},
		function()
		{
			loaded();
			$("#error").slideDown();
			$("#entry").slideDown();
		}
	);
}

function formatTime(input)
{
	var output = input.replace(/\./g, ':');
	if (output.length == 4)
	{
		output = output.substring(0, 2) + ":" + output.substring(2,4);
	}
	return output;
}

function saveAARun()
{
	var json = 
		"{" +
			"'dutyDate':'" + $("#txtAAShiftDate").val() +
			"', 'collectDateTime':'" + $("#txtAAShiftDate").val() + " " + formatTime($("#txtAAPickupTime").val()) + 
			"', 'deliverDateTime':'" + $("#txtAAShiftDate").val() + " " + formatTime($("#txtAADeliverTime").val()) + 
			"', 'returnDateTime':'" + $("#txtAAShiftDate").val() + " " + formatTime($("#txtAAReturnTime").val()) + 
			"', 'controllerMemberId':'" + controllerId + 
			"', 'riderMemberId':'" + aaRiderId + 
			"', 'vehicleTypeId':'" + aaVehicleId + 
			"', 'boxesOutCsv':'" + outCsv() + 
			"', 'boxesInCsv':'" + inCsv() + 
			"', 'notes':'" + $("#txtAANotes").val().replace(/'/g, '') + 
		"'}";
	loading();
	$("#entry").slideUp();
	$("#error").slideUp();
	// Hit it
	callServerSide(
		"Service/Service.asmx/LogAARun", 
		json,
		function(json)
		{
			loaded();
			$("#success").slideDown();
			//window.setTimeout('window.location.href="RecentRuns.aspx"', 3000);
		},
		function()
		{
			loaded();
			$("#error").slideDown();
			$("#entry").slideDown();
		}
	);
}


function getLocation(locationName)
{
	for(var x = 0; x < locations.length; x++)
	{
		if (locations[x].LocationName == locationName)
		{
			return locations[x];
		}
	}
	return null;
}

function validate(notRun)
{
	if (runType == "")
	{
		niceAlert("You need to choose a Run Type");	return false;
	}
	controllerId = getControllerId($("#txtController").val())
	if (controllerId == 0)
	{
		niceAlert("You need to choose a Controller.  You MUST choose an item from the list or type it exactly."); return false;
	}
	if (runType=="aa")
	{
		aaRiderId = getMemberId($("#txtAARider").val())
		if (aaRiderId == 0)
		{
			niceAlert("You need to choose a Rider.  You MUST choose an item from the list or type it exactly."); return false;
		}
		if ($("#txtAAShiftDate").val() == "") 
		{
			niceAlert("What AA shift date are you logging against?"); return false;
		}
		if (outBox1 + inBox1 + outBox2 + inBox2 == 0)
		{
			niceAlert("Please choose the box numbers we took to / from KSSAA."); return false;
		}
		if (aaVehicleId == 0)
		{
			niceAlert("What did the rider / driver travel on or in?"); return false;
		}
		if ($("#txtAAPickupTime").val() == "") 
		{
			niceAlert("What time did the rider pickup?"); return false;
		}
		if ($("#txtAADeliverTime").val() == "") 
		{
			niceAlert("What time did the rider deliver?"); return false;
		}
		if ($("#txtAAReturnTime").val() == "") 
		{
			niceAlert("What time did the rider return?"); return false;
		}
		if (!isValidTime($("#txtAAPickupTime").val()))
		{
			niceAlert("Please use 24 hour HH:MM time formats (Pickup Time)"); return false;
		}
		if (!isValidTime($("#txtAADeliverTime").val()))
		{
			niceAlert("Please use 24 hour HH:MM time formats (Deliver Time)"); return false;
		}
		if (!isValidTime($("#txtAAReturnTime").val()))
		{
			niceAlert("Please use 24 hour HH:MM time formats (Return Time)"); return false;
		}
	}
	if (runType=="blood")
	{
		
		if (!notRun)
		{
			riderId = getMemberId($("#txtRider").val())
			if (riderId == 0)
			{
				niceAlert("You need to choose a Rider.  You MUST choose an item from the list or type it exactly."); return false;
			}
			if (vehicleId == 0)
			{
				niceAlert("What did the rider / driver travel on or in?"); return false;
			}
			if ($("#txtDeliverDate").val() == "") 
			{
				niceAlert("What date did we deliver?"); return false;
			}
			if ($("#txtPickupDate").val() == "") 
			{
				niceAlert("What date did we pickup?"); return false;
			}
			if (!isValidTime($("#txtPickupTime").val()))
			{
				niceAlert("Please use 24 hour HH:MM time formats (Pickup Time)"); return false;
			}
			if (!isValidTime($("#txtDeliverTime").val()))
			{
				niceAlert("Please use 24 hour HH:MM time formats (Deliver Time)"); return false;
			}
			if ($("#txtHomeSafeTime").val() != "" && !isValidTime($("#txtHomeSafeTime").val()))
			{
				niceAlert("Please use 24 hour HH:MM time formats (Home Safe Time, you can leave it blank)"); return false;
			}
		}
		if ($("#txtShiftDate").val() == "") 
		{
			niceAlert("What shift date are you logging against?"); return false;
		}
		if ($("#txtCallDate").val() == "") 
		{
			niceAlert("What date did the call come in?"); return false;
		}
		if ($("#txtCallTime").val() == "") 
		{
			niceAlert("What time did the call come in?"); return false;
		}
		if (bloodBox + plasmaBox + plateletsBox + sampleBox + packageBox + milkBox == 0)
		{
			niceAlert("What did the rider / driver carry?"); return false;
		}
		callerLocationId = getLocationId($("#txtCaller").val());
		if (callerLocationId == 0)
		{
			niceAlert("Who called SERV NOW?  You MUST choose an item from the list or type it exactly."); return false;
		}
		originLocationId = getLocationId($("#txtOrigin").val());
		if (originLocationId == 0)
		{
			niceAlert("What was the consignments origin? (This may not be where we collected from)  You MUST choose an item from the list or type it exactly."); return false;
		}
		pickupLocationId = getLocationId($("#txtPickup").val());
		if (pickupLocationId == 0)
		{
			niceAlert("Where did we pickup from?  You MUST choose an item from the list or type it exactly."); return false;
		}
		dropLocationId = getLocationId($("#txtDrop").val());
		if (dropLocationId == 0)
		{
			niceAlert("Where did we drop off?  You MUST choose an item from the list or type it exactly."); return false;
		}
		finalLocationId = getLocationId($("#txtFinalDest").val());
		if (finalLocationId == 0)
		{
			niceAlert("What was the consignments final destination? (This may not be where we dropped off).  You MUST choose an item from the list or type it exactly."); return false;
		}
		if (!isValidTime($("#txtCallTime").val()))
		{
			niceAlert("Please use 24 hour HH:MM time formats (Call Time)"); return false;
		}
	}
	return true;
}

function updateUrgency()
{
	$("#btnUrgency1").attr('disabled', false);
	$("#btnUrgency2").attr('disabled', false);
	$("#btnUrgency3").attr('disabled', false);
	$("#btnUrgency" + urgency).attr('disabled', true);
}

function updateBoxCounts()
{
	if (bloodBox < 0) { bloodBox = 0; }
	if (plasmaBox < 0) { plasmaBox = 0; }
	if (plateletsBox < 0) { plateletsBox = 0; }
	if (sampleBox < 0) { sampleBox = 0; }
	if (packageBox < 0) { packageBox = 0; }
	if (milkBox < 0) { milkBox = 0; }
	if (outBox1 < 0) { outBox1 = 0; }
	if (outBox2 < 0) { outBox2 = 0; }
	if (inBox1 < 0) { inBox1 = 0; }
	if (inBox2 < 0) { inBox2 = 0; }
	$("#btnBloodBox").text(bloodBox);
	$("#btnPlasmaBox").text(plasmaBox);
	$("#btnPlateletsBox").text(plateletsBox);
	$("#btnSampleBox").text(sampleBox);
	$("#btnPackageBox").text(packageBox);
	$("#btnMilkBox").text(milkBox);
	$("#btnOutBox1").text(outBox1);
	$("#btnOutBox2").text(outBox2);
	$("#btnInBox1").text(inBox1);
	$("#btnInBox2").text(inBox2);
}

function warnOnUnload()
{
	window.onbeforeunload = function(){ return 'You will lose all data you have entered!' };
}

function showBloodPanel()
{
	warnOnUnload();
	runType="blood";
	$("#cmdNotRun").slideDown();
	$("#blood").slideUp();
	$("#AA").slideUp();
	$("#Water").slideUp();
	$("#Milk").slideUp();
	$("#blood").slideDown();
	if (runLogID < 0)
	{
		$('html, body').animate({
	        scrollTop: $("#blood").offset().top
	    }, 1000);
	}
}

function showAAPanel()
{
	warnOnUnload();
	runType="aa";
	$("#cmdNotRun").slideUp();
	$("#blood").slideUp();
	$("#AA").slideUp();
	$("#Water").slideUp();
	$("#Milk").slideUp();
	$("#AA").slideDown();
}

function showMilkPanel()
{
	warnOnUnload();
	runType="milk";
	$("#blood").slideUp();
	$("#AA").slideUp();
	$("#Water").slideUp();
	$("#Milk").slideUp();
	$("#Milk").slideUp();
	$("#blood").slideDown();
}

function showWaterPanel()
{
	warnOnUnload();
	runType="water";
	$("#blood").slideUp();
	$("#AA").slideUp();
	$("#Water").slideUp();
	$("#Milk").slideUp();
	$("#Water").slideUp();
	$("#blood").slideDown();
}

function listVehicleTypes()
{
	writeVehicleTypes("lstVehicles", vehicleSelected);
	writeVehicleTypes("lstAAVehicles", aaVehicleSelected);
}

function vehicleSelected(vehicleTypeId, vehicleType)
{
	$("#btnVehicle").text(vehicleType);
	vehicleId = vehicleTypeId;
}

function aaVehicleSelected(vehicleTypeId, vehicleType)
{
	$("#btnAAVehicle").text(vehicleType);
	aaVehicleId = vehicleTypeId;
}

function callerSelected()
{
	var loc = getLocation($("#txtCaller").val());
	if (loc != null)
	{
		if (loc.Hospital)
		{
			if ($("#txtFinalDest").val() == "")
			{
				$("#txtFinalDest").val(loc.LocationName);
			}
		}
	}
}

function originSelected()
{
	var loc = getLocation($("#txtOrigin").val());
	if (loc != null)
	{
		if (loc.BloodBank)
		{
			if ($("#txtPickup").val() == "")
			{
				$("#txtPickup").val(loc.LocationName);
			}
		}
	}
}

function collectedFromSelected()
{
	var loc = getLocation($("#txtPickup").val());
	if (loc != null)
	{
		if (loc.BloodBank)
		{
			if ($("#txtOrigin").val() == "")
			{
				$("#txtOrigin").val(loc.LocationName);
			}
		}
	}
}

function takenToSelected()
{
	var loc = getLocation($("#txtDrop").val());
	if (loc != null)
	{
		if (!loc.ChangeOver)
		{
			if ($("#txtFinalDest").val() == "")
			{
				$("#txtFinalDest").val(loc.LocationName);
			}
		}
	}
	document.title = $("#txtRider").val() + " -> " + $("#txtDrop").val();
}

function riderSelected()
{
	document.title = $("#txtRider").val() + " -> " + $("#txtDrop").val();
}
	
