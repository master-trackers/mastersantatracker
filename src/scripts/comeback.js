   // Function to toggle settings popup visibility
   function toggleSettings() {
    var settingsPopup = document.getElementById('settingsPopup');
    if (settingsPopup.style.display === 'block') {
      settingsPopup.style.display = 'none';
    } else {
      settingsPopup.style.display = 'block';
    }
  }
  function openDonationScreen() {
    // Create the iframe element
    var iframe = document.createElement('iframe');

    // Set the source to "/donationiframe"
    iframe.src = "/donationiframe";

    // Set the iframe styles
    iframe.style.position = "fixed";
    iframe.style.top = "50%";
    iframe.style.left = "50%";
    iframe.style.transform = "translate(-50%, -50%)";
    iframe.style.width = "90vw";
    iframe.style.height = "90vh";
    iframe.style.border = "none";
    iframe.style.zIndex = "9999";

    // Create close button
    var closeButton = document.createElement('button');
    closeButton.textContent = "x";
    closeButton.style.position = "absolute";
    closeButton.style.top = "100px";
    closeButton.style.right = "10px";
    closeButton.style.padding = "5px";
    closeButton.style.background = "rgba(0, 0, 0, 0.5)";
    closeButton.style.color = "#fff";
    closeButton.style.border = "none";
    closeButton.style.borderRadius = "50%";
    closeButton.style.cursor = "pointer";
    closeButton.style.zIndex = "10000";
    closeButton.onclick = function () {
      document.body.removeChild(iframe);
      document.body.removeChild(closeButton);
    };

    // Append the iframe and close button to the body
    document.body.appendChild(iframe);
    document.body.appendChild(closeButton);
  }
  // Function to handle SSE messages
  // Function to handle SSE messages
function handleSSE(event) {
  // Parse the event data
  const data = JSON.parse(event.data);
  
  // Check if the tracker has started
  if (data.unlocked === true) {
      // Refresh the page to the home page if the tracker has started
      window.location.href = '/';
  }
if (data.refresh === true) {
        window.location.href = "/"
      }
}






// Function to start listening for SSE messages
function startSSE() {
  const eventSource = new EventSource('/updates');
  eventSource.onmessage = handleSSE;
}
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

  console.log(`IP: ${ip}, Country: ${country}`);

  // Step 2: Send hit with number and country
  const hitResponse = await fetch(`/hit/4?country=${country}`);
  if (!hitResponse.ok) {
    throw new Error('Failed to send hit');
  }

  // Handle successful response
  console.log('Hit sent successfully');
} catch (error) {
  console.error('Error:', error);
}
}

// Call the function to perform the operations
fetchIpAndSendHit();

// Start listening for SSE messages
// startSSE();
