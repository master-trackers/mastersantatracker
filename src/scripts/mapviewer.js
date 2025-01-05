window.onload = function () {
      // Function to make a GET request to /visitsite endpoint
      function getVisits() {
        fetch('/visitsite')
          .then(response => response.json())
          .then(data => {
            // console.log('Number of people on the site:', data.peopleonthesite);
          })
          .catch(error => {
            console.error('Error fetching data:', error);
          });
      }

      // Call the getVisits function when the page loads
      getVisits();
    }
    // Parse the URL to get the value of the "level" parameter
    var url = new URL(window.location.href);
    var level = url.searchParams.get("zoom");
    var level2 = url.searchParams.get("nobaskets");

    // Get the iframe element

   
    // Function to toggle settings popup visibility
    function toggleSettings() {
      var settingsPopup = document.getElementById('settingsPopup');
      if (settingsPopup.style.display === 'block') {
        settingsPopup.style.display = 'none';
      } else {
        settingsPopup.style.display = 'block';
      }
    }

    // Function to update local time
    function updateLocalTime() {
      var now = new Date(currenttimeunixsec);
      var hours = now.getHours() % 12 || 12;
      var minutes = now.getMinutes().toString().padStart(2, "0");
      var seconds = now.getSeconds().toString().padStart(2, "0");
      var ampm = now.getHours() >= 12 ? "PM" : "AM";
      document.getElementById("local-time").textContent =
        hours + ":" + minutes + ":" + seconds + " " + ampm + " LOCAL";
    }

// Function to update UTC time
function updateUTCTime() {
  var now = new Date(currenttimeunixsec);
  var hours = now.getUTCHours() % 12 || 12;
  var minutes = now.getUTCMinutes().toString().padStart(2, "0");
  var seconds = now.getUTCSeconds().toString().padStart(2, "0");
  var ampm = now.getUTCHours() >= 12 ? "PM" : "AM";
  document.getElementById("utc-time").textContent =
    hours + ":" + minutes + ":" + seconds + " " + ampm + " UTC/GMT";
}

// Function to update London time (GMT/UTC time zone)
function updateLondonTime() {
  var now = new Date(currenttimeunixsec);
  var hours = now.getUTCHours() % 12 || 12; // London is in the GMT/UTC time zone
  var minutes = now.getUTCMinutes().toString().padStart(2, "0");
  var seconds = now.getUTCSeconds().toString().padStart(2, "0");
  var ampm = now.getUTCHours() >= 12 ? "PM" : "AM";
  document.getElementById("london-time").textContent =
    hours + ":" + minutes + ":" + seconds + " " + ampm + " LONDON";
}
// Function to update New York City time (assuming permanent Standard Time)
function updateNYCTime() {
  var now = new Date(currenttimeunixsec);
  var offset = -5; // Always assume Standard Time is in effect (UTC-5)
  var utcHours = now.getUTCHours();
  var hours = (utcHours + offset + 24) % 24; // Ensure positive value before modulo
  var ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  var minutes = now.getUTCMinutes().toString().padStart(2, "0");
  var seconds = now.getUTCSeconds().toString().padStart(2, "0");
  document.getElementById("nyc-time").textContent =
    hours + ":" + minutes + ":" + seconds + " " + ampm + " NYC";
}
// Function to update Tokyo time (Japan Standard Time)
function updateTokyoTime() {
  var now = new Date(currenttimeunixsec);
  var hours = (now.getUTCHours() + 9) % 24; // Tokyo is in the Japan Standard Time zone (GMT+9 in standard time)
  var ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  var minutes = now.getUTCMinutes().toString().padStart(2, "0");
  var seconds = now.getUTCSeconds().toString().padStart(2, "0");
  document.getElementById("tokyo-time").textContent =
    hours + ":" + minutes + ":" + seconds + " " + ampm + " TOKYO";
}

    var readyfordeployment = false
    // Update local time, UTC time, London time, New York City time, and Tokyo time every second
    setInterval(function () {
      if (readyfordeployment === true) {
        updateLocalTime();
        updateUTCTime();
        updateLondonTime();
        updateNYCTime();
        updateTokyoTime();
      }
    }, 1000);

    setTimeout(function () {
      document.getElementById("logo").classList.add("spread");
      document.getElementById("loading").classList.add("show");
    }, 1000);

    setTimeout(function () {
      document.getElementById("logo").style.display = "none";
      document.getElementById("loading").style.display = "none";
      document.getElementById("iframe").style.visibility = "visible";
      document.getElementById("srcimg").style.display = "none";
            document.getElementById("iframe").style.opacity = 1;
      readyfordeployment = true
    }, 3000); // Adjust the timing as needed

        // Assuming you want to send a GET request to "/hit/"
   // Replace with your IP geolocation API endpoint
const ipapiUrl = 'https://ipapi.co/json/'; // ipapi endpoint

// Function to fetch IP and country, then send a hit
async function fetchIpAndSendHit() {
  try {
    // Step 1: Get IP and country
    const ipResponse = await fetch(ipapiUrl);
    if (!ipResponse.ok) {
      throw new Error('Failed to fetch IP information');
    }

    const ipData = await ipResponse.json();
    const ip = ipData.ip;
    const country = ipData.country_code; // Or ipData.country_name for country name

    // console.log(`IP: ${ip}, Country: ${country}`);

    // Step 2: Send hit with number and country
    const hitResponse = await fetch(`/hit/1?country=${country}`);
    if (!hitResponse.ok) {

      throw new Error('Failed to send hit');
    }

    // Handle successful response
    // console.log('Hit sent successfully');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Call the function to perform the operations
fetchIpAndSendHit();