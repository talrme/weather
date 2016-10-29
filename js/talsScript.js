dataCache = {};
currentLocationLatLon = "";
currentLocationLatLon = "CA/Walnut_Creek";
getLatLon();



function geoLocationReady(){
	$( document ).ready(function() {
		
		
		// Load page up
		directPage();

		// Load new data when the web address changes
		$(window).on('hashchange', function() {
			directPage();
		});

		// Make navbar collapse when an option is selected
		$(".navbar-nav li a").click(function(event) {
			$(".navbar-collapse").collapse('hide');
		});

		// Search bar autocomplete

		$("#searchBar").autocomplete({
			source: function(request,response){
			    $.ajax({
				dataType: "jsonp",
				url: "https://autocomplete.wunderground.com/aq?query="+$("#searchBar").val(),
				jsonp: 'cb',

				success: function(data){
				    console.log(data);
				    var searchOptions = cleanSearchOptions(data);
				    response(searchOptions);
				}// end success function
			    }); // end AJAX call
			},
			select: function(event,ui){
			    var newPostHash = "zmw:"+ui.item.link;
			    //collapse navbar on mobile
			    $(".navbar-collapse").collapse('hide');
			    window.location.hash = newPostHash;
			}

		}); // end autocomplete	

	}); // end Document Ready

} // end geoLocation Ready


function cleanSearchOptions(data){
    var cleanedUpData = [];
    $.each(data.RESULTS, function(index, val){
		cleanedUpData.push({
		    label: val.name,
		    link: val.zmw
		});
    });
    console.log(cleanedUpData);
    return cleanedUpData;
}

function directPage(){
	var postHash = window.location.hash.substr(1);
	if (postHash==""){
		loadNewPage(currentLocationLatLon);
	} else if (postHash=="currentLocation") {
		loadNewPage(currentLocationLatLon);
	} else {
		loadNewPage(postHash);
	}
}


/*
function loadOriginalPage(){
	
	
	$("#mainDash").show();
	$("#forecastTitle").show();
	$("#cityDash").hide();


	//Show Berkeley, Minneapolis and Kittery Point Current temps


	retreiveMainInfo("CA/Berkeley","berkeley");
	retreiveMainInfo("MN/Minneapolis","minneapolis");
	retreiveMainInfo("ME/Kittery_Point","kitteryPoint");

	//Load Berkeley Forecasts
	
	
	getHourlyForecast("CA/Berkeley");
	retrieve10DayForecast("CA/Berkeley");
	//loadCurrentCityName();



}
*/

function loadNewPage(postHash){
	
	getHourlyForecast(postHash);
	retrieve10DayForecast(postHash);
	
	$("#mainDash").hide();
	$("#cityDash").show();
	$("#searchBar").val('');

	if (postHash==currentLocationLatLon){
		$("#currentLocNote").show();
	} else {
		$("#currentLocNote").hide();
	}

	window.scrollTo(0, 0);

	loadCityDash(postHash);

	//Show Berkeley, Minneapolis and Kittery Point Current temps
	//retreiveMainInfo("CA/Berkeley","berkeley");
	//retreiveMainInfo("MN/Minneapolis","minneapolis");
	//retreiveMainInfo("ME/Kittery_Point","kitteryPoint");

	
}


function retreiveMainInfo(location,id){
	//First check if conditions have been loaded already
	if (dataCache["coditions"+location]){
		var data = dataCache["coditions"+location];
		
		console.log("Data for "+id+":");
		console.log(data);
		loadMainInfo(data,id);

	// Otherwise, GET them
	} else {

		$.ajax({
			dataType: "json",
			url: 'http://api.wunderground.com/api/2ee32ccf55d24c3e/conditions/q/'+location+'.json',
			//data: data,
			success: function(data){
				console.log("Data for "+id+":");
				console.log(data);
				loadMainInfo(data,id);
				dataCache["coditions"+location] = data; // Add conditions to cache
			}
		});
	}

}

function loadMainInfo(data,city){
	var temp = data.current_observation.temp_f;
	temp = temp+"&deg;"
	$("#"+city+"LinkTemp").html(' ('+temp+')');
	$("#"+city+"Temp").html(temp);
	//$("#"+city+"Link").append(' ('+temp+')');

	var dataIconURL = data.current_observation.icon_url;
	var iconURL = "images/conditionIcons/"+ dataIconURL.substring(dataIconURL.lastIndexOf("/") + 1, dataIconURL.length-4)+".png";
	//var icon = data.current_observation.icon;
	
	var imgHTML = '<img id="'+city+'ImageInner" class="img-rounded" height="75px" src="'+iconURL+'">';
	$("#"+city+"Image").html(imgHTML);

	// For current city, don't make the image hide:
	$("#currentCityImageInner").removeClass("hidden-xs");

}


function loadCityDash(postHash){
	
	//Get Current Temp
	retreiveMainInfo(postHash,"currentCity");
	

	// Display city name:
	if (dataCache["geolookup"+postHash]){
		var data = dataCache["geolookup"+postHash];
		
		console.log("Geo Lookup Data for "+postHash+":");
		console.log(data);
		var cityName = data.location.city;
		$("#currentCityName").html(cityName);
		$("#cityName").html(cityName);

	// Otherwise, GET them
	} else {


		$.ajax({
			dataType: "json",
			url: 'http://api.wunderground.com/api/2ee32ccf55d24c3e/geolookup/q/'+postHash+'.json',
			//data: data,
			success: function(data){
				console.log("Geo Lookup Data for "+postHash+":");
				console.log(data);
				var cityName = data.location.city;
				$("#currentCityName").html(cityName);
				$("#cityName").html(cityName);
				dataCache["geolookup"+postHash] = data;
			}
		});
	}
}


function loadCurrentCityName(){
	$.ajax({
			dataType: "json",
			url: 'http://api.wunderground.com/api/2ee32ccf55d24c3e/geolookup/q/autoip.json',
			//data: data,
			success: function(data){
				var cityName = data.location.city;
				$("#cityName").html(cityName);
			}
		});




}

function retrieve10DayForecast(city){

	if (dataCache["forecast10day"+city]){
		var data = dataCache["forecast10day"+city];
		console.log("10 Day Data for "+city+":");
		console.log(data);
		load10DayForecast(data);
		

	// Otherwise, GET them
	} else{

	
		URL = "http://api.wunderground.com/api/2ee32ccf55d24c3e/forecast10day/q/"+city+".json";

		$.ajax({
			dataType: "json",
			url: URL,
			//data: data,
			success: function(data){
				console.log("10 Day Data for "+city+":");
				console.log(data);
				load10DayForecast(data);
				dataCache["forecast10day"+city] = data;
			}
		});	
	}


}


function load10DayForecast(data){

	output = "";
	
	for (i=0;i<8;i++){

		var shortCut = data.forecast.simpleforecast.forecastday[i]; 
		var day = shortCut.date.weekday;
		var dataIconURL = shortCut.icon_url;
		var iconURL = "images/conditionIcons/"+ dataIconURL.substring(dataIconURL.lastIndexOf("/") + 1, dataIconURL.length-4)+".png";
		var high = shortCut.high.fahrenheit;
		var low = shortCut.low.fahrenheit;
		var pop = shortCut.pop;

		output+= '<div align="center" class="col-md-3 col-xs-6 daily">';
		output+=		  '<div ><b><u>'+day+'</u></b><br>';
		output+=		  '<img src="'+iconURL+'" height="45px"> <b>'+high+'&deg;/'+low+'&deg;</b><br>';
		output+=		  '<img src="images/rainDrop.png" height="12px"><small>'+pop+'%</small> </div></div>';
	}

	$('#tenDayForecast').html(output);

	//<tr><td><b>Monday</b></td>
      //    <td class="centerTD">72&deg;</td>
        //  <td class="centerTD"><img class="img-rounded" height="25px" src="http://icons.wxug.com/i/c/a/partlycloudy.gif"><td>
    //</tr>

}


function getHourlyForecast(postHash){
	
	if (dataCache["hourly"+postHash]){
		var data = dataCache["hourly"+postHash];

		console.log("Hourly Data for "+postHash+":");
		console.log(data);
		loadHourlyForecast(data);
	}	

	// Otherwise, GET them

	else{

		URL = 'http://api.wunderground.com/api/2ee32ccf55d24c3e/hourly/q/'+postHash+'.json';

		$.ajax({
			dataType: "json",
			url: URL,
			//data: data,
			success: function(data){
				console.log("Hourly Data for "+postHash+":");
				console.log(data);
				loadHourlyForecast(data);
				dataCache["hourly"+postHash] = data;	
			}
		});	
	}

}



function loadHourlyForecast(data){
	
	//Forecast Briefing:

	var output="";
	var day ="";
	var dataIconURL="";
	var iconURL ="";
	var temp ="";
	var condition="";
	var pop = "";
	var shortCut="";

	var option1 = [[8,"This Morning"],[15,"This Afternoon"],[19,"This Evening"]];
	var option2 = [[15,"This Afternoon"],[19,"This Evening"],[39,"Tomorrow Afternoon"]];
	var option3 = [[19,"This Evening"],[22,"Tonight"],[39,"Tomorrow Afternoon"]];
	var option4 = [[22,"Tonight"],[32,"Tomorrow Morning"],[39,"Tomorrow Afternoon"]];
	var option5 = [[32,"Tomorrow Morning"],[39,"Tomorrow Afternoon"],[43,"Tomorrow Evening"]];
	var adjustedIndex = 0;
	
	var nextTime = data.hourly_forecast[0].FCTTIME.hour;

	if (nextTime==0) {nextTime=24};
	
	if (nextTime>22){
		var timelineArray = option5;
	} else if (nextTime>19){
		var timelineArray = option4;
	} else if (nextTime>15){
		var timelineArray = option3;
	} else if (nextTime>8){
		var timelineArray = option2;
	} else {
		var timelineArray = option1;
	}


	for (var i=0; i<3; i++){
		adjustedIndex = timelineArray[i][0]-nextTime;
		shortcut= data.hourly_forecast[adjustedIndex];
		day = timelineArray[i][1];
		time = shortcut.FCTTIME.civil;
		//iconURL= shortcut.icon_url;
		dataIconURL = shortcut.icon_url;
		iconURL = "images/conditionIcons/"+ dataIconURL.substring(dataIconURL.lastIndexOf("/") + 1, dataIconURL.length-4)+".png";
		temp = shortcut.temp.english;
		condition = shortcut.condition;
		pop = shortcut.pop;

		output+='<div align="center" class="col-md-4 col-sm-6"><div class="dropShadow"><big><b><u>'+day+'</u></b></big><br><img src="'+iconURL+'" height="75px"> <b><big>'+temp+'&deg;</big> </b><b class="hidden-xs"><br>'+condition	+'</b><br> '+pop+'% Precip </div></div>'

	}

	$("#forecastBriefing").html(output);

	// Hourly Forcast
	output="";
	var adjustedIndex = 0; //Ensures that the hours between midnight and 7am are ignored

	for(i=0;i<20;i++){
		shortcut=data.hourly_forecast[adjustedIndex];
		time = (shortcut.FCTTIME.hour%12); 
		if (time==0){
			if(shortcut.FCTTIME.ampm=="AM"){
				time = 'Mid<span class="hidden-xs">night<span>';
			} else{
				time = "Noon";
			}
		} else{
			time += " "+ shortcut.FCTTIME.ampm;
		}
		armyTime = shortcut.FCTTIME.hour;
		//iconURL= shortcut.icon_url;
		dataIconURL = shortcut.icon_url;
		iconURL = "images/conditionIcons/"+ dataIconURL.substring(dataIconURL.lastIndexOf("/") + 1, dataIconURL.length-4)+".png";
		
		temp = shortcut.temp.english;
		pop = shortcut.pop;
		
		if (armyTime<7){
			var indexDiff = 6-armyTime;
			adjustedIndex += indexDiff;
		}
		adjustedIndex +=1;


		output+=	'<tr>';
        output+=       '<td class="centerTD"><b>'+time+'</b></td>';
        output+=       '<td class="centerTD">'+temp+'&deg;</td>';
        output+=       '<td class="centerTD"><img class="img-rounded" height="25px" src="'+iconURL+'"></td>';
        output+=       '<td class="centerTD">'+pop+'%</td>';
        output+=    '</tr>';

		
		
	}

	$("#hourlyForecast").html(output);
	//<div class="row">

      //                <div align="center" class="col-md-2 col-xs-4">
        //                <div ><b><u>1PM</u></b><br><img src="http://icons.wxug.com/i/c/k/mostlycloudy.gif" height="45px"> <b>77&deg;</ </b><br> <img src="images/rainDrop.png" height="15px"><small>0%</small> </div>
          //            </div>

   //Generate Graphs
   //Hourly Temp Graph	
   var cleanData = cleanUpForecastDataTemp(data);
   g = new Dygraph(

	  // containing div
	  document.getElementById("hourlyTempGraph"), 
	  "Date,Temp\n"
	  +cleanData,
	  // options
	  {
	  	xRangePad: 10,
	  	yRangePad: 10,
	  	//xValueFormatter: Dygraph.dateString_,
	  	xValueParser: function (x) {
	  		return 1000 * parseInt(x, 10);
	  	},
	  	xTicker: Dygraph.dateTicker,
	  	labels: ["Time", "Temperature"],
	  	//title: "Hourly Temperatures",
	  	legend: "never",
	  	drawPoints: "true",
	  	pointSize: 2,
	  	colors: ["orange", "blue", "black"],
	  	strokeWidth: 1,
	  	showRangeSelector: true,
	  	ylabel: 'Temperature (F)'
	  });


	

} //end loadHourlyForecast



function cleanUpForecastDataTemp(data){
	var cleanData = "";

	for (i=0;i<36;i++){
		var shortCut = data.hourly_forecast[i];
		var time = shortCut.FCTTIME.epoch;
		var temp = shortCut.temp.english;
		cleanData += time+","+temp+"\n";
	}

	return cleanData;
}


function getLatLon() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, positionError);
    } 
}

function showPosition(position) {
    var latLon = position.coords.latitude + "," + position.coords.longitude; 
    console.log("LatLon:");
    console.log(latLon);
    currentLocationLatLon = latLon;
    
    geoLocationReady();
    //alert(latLon);
    //window.location.hash = currentLocationLatLon;
}

function positionError(){
	alert("Current location Can't be determined");
}



