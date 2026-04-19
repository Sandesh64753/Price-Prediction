function getBathValue() {
  var uiBathrooms = document.getElementsByName("uiBathrooms");
  for(var i in uiBathrooms) {
    if(uiBathrooms[i].checked) {
        return parseInt(i)+1;
    }
  }
  return -1; // Invalid Value
}

function getBHKValue() {
  var uiBHK = document.getElementsByName("uiBHK");
  for(var i in uiBHK) {
    if(uiBHK[i].checked) {
        return parseInt(i)+1;
    }
  }
  return -1; // Invalid Value
}

function saveToLocalStorage(sqft, bhk, bathrooms, location, estimatedPrice) {
  // Create a record object
  var record = {
    sqft: sqft,
    bhk: bhk,
    bathrooms: bathrooms,
    location: location,
    estimatedPrice: estimatedPrice,
    timestamp: new Date().toLocaleString()
  };
  
  // Get existing records from localStorage
  var records = localStorage.getItem('priceHistory');
  var recordsArray = records ? JSON.parse(records) : [];
  
  // Add new record
  recordsArray.push(record);
  
  // Save back to localStorage
  localStorage.setItem('priceHistory', JSON.stringify(recordsArray));
  
  // Also save current input values
  localStorage.setItem('lastSqft', sqft);
  localStorage.setItem('lastBhk', bhk);
  localStorage.setItem('lastBathrooms', bathrooms);
  localStorage.setItem('lastLocation', location);
  localStorage.setItem('lastEstimatedPrice', estimatedPrice);
  
  console.log("Data saved to localStorage");
}

function onClickedEstimatePrice() {
  console.log("Estimate price button clicked");
  var sqft = document.getElementById("uiSqft");
  var bhk = getBHKValue();
  var bathrooms = getBathValue();
  var location = document.getElementById("uiLocations");
  var estPrice = document.getElementById("uiEstimatedPrice");

  // var url = "http://127.0.0.1:5000/predict_home_price"; //Use this if you are NOT using nginx which is first 7 tutorials
  var url = "/predict_home_price"; // Use this if  you are using nginx. i.e tutorial 8 and onwards

  $.post(url, {
    total_sqft: parseFloat(sqft.value),
    bhk: bhk,
    bath: bathrooms,
    location: location.value
}, function(data, status) {

    console.log("FULL RESPONSE:", data);

    if (!data || !data.estimated_price) {
        console.error("Invalid response from server");
        estPrice.innerHTML = "<h2>Error getting price</h2>";
        return;
    }

    estPrice.innerHTML = "<h2>" + data.estimated_price + " Lakh</h2>";
    
    // Save to localStorage
    saveToLocalStorage(
      sqft.value,
      bhk,
      bathrooms,
      location.value,
      data.estimated_price
    );
});
}

function onPageLoad() {
  console.log( "document loaded" );
  
  // Load saved values from localStorage
  var lastSqft = localStorage.getItem('lastSqft');
  var lastBhk = localStorage.getItem('lastBhk');
  var lastBathrooms = localStorage.getItem('lastBathrooms');
  var lastLocation = localStorage.getItem('lastLocation');
  var lastEstimatedPrice = localStorage.getItem('lastEstimatedPrice');
  
  // Restore input values
  if (lastSqft) {
    document.getElementById("uiSqft").value = lastSqft;
  }
  if (lastBhk) {
    var bhkRadios = document.getElementsByName("uiBHK");
    for(var i in bhkRadios) {
      if(bhkRadios[i].value == lastBhk) {
        bhkRadios[i].checked = true;
      }
    }
  }
  if (lastBathrooms) {
    var bathRadios = document.getElementsByName("uiBathrooms");
    for(var i in bathRadios) {
      if(bathRadios[i].value == lastBathrooms) {
        bathRadios[i].checked = true;
      }
    }
  }
  if (lastLocation) {
    document.getElementById("uiLocations").value = lastLocation;
  }
  if (lastEstimatedPrice) {
    document.getElementById("uiEstimatedPrice").innerHTML = "<h2>" + lastEstimatedPrice + " Lakh</h2>";
  }
  
  // var url = "http://127.0.0.1:5000/get_location_names"; // Use this if you are NOT using nginx which is first 7 tutorials
  var url = "/get_location_names"; // Use this if  you are using nginx. i.e tutorial 8 and onwards
  $.get(url,function(data, status) {
      console.log("got response for get_location_names request");
      if(data) {
          var locations = data.locations;
          var uiLocations = document.getElementById("uiLocations");
          $('#uiLocations').empty();
          for(var i in locations) {
              var opt = new Option(locations[i]);
              $('#uiLocations').append(opt);
          }
          
          // Restore selected location after populating
          if (lastLocation) {
            document.getElementById("uiLocations").value = lastLocation;
          }
      }
  });
}

window.onload = onPageLoad;
