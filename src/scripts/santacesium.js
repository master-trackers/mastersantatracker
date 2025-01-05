var url = new URL(window.location.href);
let placedBaskets = [];
let startallowed = false;
let alreadyremovediss = false;
let alreadyinsertediss = false;
let trackeneityenabled = true;
let debounce13479812734 = false;
let activelyturning = false;
let allowedtotweenheight = true;
let ended2 = false;
let actualtime
let allowedtoheightincrease2 = true;
let allowedtofrontoscilate = true;
let allowedtocameraeffect = false;
let isheadingrn = false;
let allowedtotrackedentity = false;
var alreadyrolled = false
var prog1 = 0;
let height2 = 0;
let height3 = 15300;
let iscurrentlydelivering = true;
let allowedtohead = false;
let imageData;
let isrollingrandomly = false;
let basketsfoundyet = true;
let isheadingchanging = false;
let prog1set = false;
const randomstrings68characters = Math.random().toString(36).substring(2, 70); // Generates a random 68-character string
let timetoview = 3.3;
TweenLite.ticker.useRAF(false);
// Function to delete an entity by its ID
function deleteEntityById(viewer, entityId) {
  const entity = viewer.entities.getById(entityId);
  if (entity) {
    viewer.entities.remove(entity); // Remove the entity
    //console.log(`Entity with ID '${entityId}' has been removed.`);
  } else {
    //console.warn(`Entity with ID '${entityId}' not found.`);
  }
}
TweenLite.lagSmoothing(0);
function updateRoll(amount) {
  roll = amount; // Update roll dynamically
  console.log("Roll:", roll);
}
// Function to calculate the percentage
function findPercentage(startNum, currentNum, endNum) {
  return ((currentNum - startNum) / (endNum - startNum)) * 100;
}

(async function () {
  try {
    const response = await fetch('https://temp.master-trackers.xyz/images');

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    imageData = await response.json();
    //console.log('Data loaded:', imageData);
  } catch (error) {
    console.error('Error fetching the JSON:', error);

    warnuserError("Error", "There was an error getting the route images.")
  }
})();

//console.log(imageData)
var timeLeftValue = 0;
let presentsdeliverednumber;
function rollabit(finaldest, time) {

  TweenLite.to({ progress: 0 }, time, {
    progress: finaldest,
    ease: Linear.easeInOut,
    onUpdate: function () {
      updateRoll(this.target.progress);
    },
    onComplete: function () {
      console.log("Roll reset completed");
    },
  });

}
// Function to get latitude and longitude from IP address
async function getLatLongFromIPAddress() {
  // Check if IP address is already stored in local storage
  const storedIP = localStorage.getItem('storedIP');
  if (storedIP) {
    // If IP address is already stored, return the saved latitude and longitude
    const latitude = localStorage.getItem('latitude');
    const longitude = localStorage.getItem('longitude');
    return {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude)
    };
  } else {
    try {
      // Fetch IP address details
      const response = await fetch(`/ipinfo?request.preventcache=${randomstrings68characters}`);
      const data = await response.json();
      // Store IP address details in local storage
      localStorage.setItem('storedIP', true);
      localStorage.setItem('latitude', data.latitude);
      localStorage.setItem('longitude', data.longitude);
      // Return latitude and longitude
      return {
        latitude: data.latitude,
        longitude: data.longitude
      };
    } catch (error) {
      console.error('Error getting latitude and longitude:', error);

      warnuserError("Error", "There was an error getting data for the arrival time.")
      return null;
    }
  }
}
// Function to handle when the client loses internet connection
function handleInternetLoss() {
  warnuserWarning("Connection Warning","You have lost internet connection, according to our site. Please check your connection, this tracker will continue to run temporarily, but without a connection, it may stop.")
  // Add any additional actions you want to take here, like displaying an alert or retrying a request.
}

// Listen for the 'offline' event, which triggers when the client loses internet connection
window.addEventListener('offline', handleInternetLoss);

// Optional: You can also listen for the 'online' event to detect when the connection is restored
window.addEventListener('online', () => {
  console.log("Internet connection restored.");
});

// Function to handle Cesium Ion errors
function handleCesiumIonError(error) {
  console.error('Cesium Ion Error:', error); // Log the error message
  // Stop rendering or handle the error gracefully
  if (viewer) {
    location.reload()
  }
}
// Function to toggle settings popup visibility
function toggleSettings() {
  var settingsPopup = document.getElementById('settingsPopup');
  if (settingsPopup.style.display === 'block') {
    settingsPopup.style.display = 'none';
  } else {
    settingsPopup.style.display = 'block';
  }
}
function getFlagImageUrl(countryCode) {
  // Check if countryCode starts with 'http://' or 'https://'
  if (countryCode.includes('http://') || countryCode.startsWith('https://')) {
    return countryCode;  // Return the link itself
  } else {
    return `https://flagcdn.com/w320/${countryCode.toLowerCase()}.png`;  // Otherwise, return flag image URL
  }
}
let basketUpdateInterval;
const basketElement = document.getElementById("basketsInfo");

let currentCountry;
let currentCount = 0; // Initial count

function startBasketCounter(timeLeft, lastBasketCount, nextBasketCount) {


  // Convert all inputs to numbers
  timeLeft = Number(timeLeft);
  lastBasketCount = Number(lastBasketCount);
  nextBasketCount = Number(nextBasketCount);

  //console.log(timeLeft + lastBasketCount + nextBasketCount);

  // Object to hold the animated count
  let countObject = { count: lastBasketCount };

  TweenLite.to(countObject, timeLeft, {
    count: nextBasketCount, // Animate from lastBasketCount to nextBasketCount
    ease: Linear.easeIn, // Ensure linear progression over time
    onUpdate: function () {
      // Update the displayed count using countObject's count property
      basketElement.textContent = Math.round(countObject.count).toLocaleString();
      if (ended2 === true) {
        setTimeout(() => {
          basketElement.textContent = Math.round(countObject.count).toLocaleString() + ", one for Santa 😊."
        }, 2000);
      }
    },
    onComplete: function () {
      console.log('Basket counter complete');
    }
  });

}

function yourFunctionToRunWhenTrackerEnds() {
  //console.log("ENDED")
  source.close();
  window.location.href = "/"
}

// Set your Cesium Ion access token
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyM2Q1MWUyYS1kMDcxLTRmNmEtOWEwNC0wZTE4MjgzNmIyYWMiLCJpZCI6MTk2NTMyLCJpYXQiOjE3MDgzNzQ0NzJ9.GEf0dmAehNxx5LwDn4vzMd-XuwXVgAFXxvHB6IwUKNc';

var viewer = new Cesium.Viewer('cesiumContainer', {
  terrain: Cesium.Terrain.fromWorldTerrain({
    requestWaterMask: true,
  }),
  skyAtmosphere: false,

  shouldAnimate: true // Ensure animations are on

    
    
});
viewer.camera.frustum.fov = Cesium.Math.toRadians(120); // Set FOV to 90 degrees

// URL Template for Google Maps tiles (ensure this follows the appropriate licensing agreement)
const googleMapsLayer = new Cesium.UrlTemplateImageryProvider({
  url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', // Google's tile URL pattern
});

// Add the Google Maps layer to Cesium's imagery layer collection
viewer.imageryLayers.addImageryProvider(googleMapsLayer);

// adjust time so scene is lit by sun
// Create the custom skybox
const skyBox = new Cesium.SkyBox({
  sources: {
    positiveX: '/assets/black.png',
    negativeX: '/assets/black.png',
    positiveY: '/assets/black.png',
    negativeY: '/assets/black.png',
    positiveZ: '/assets/black.png',
    negativeZ: '/assets/black.png'
  }
});
// Variables to store current position and target position
var currentLatitude = 83.6;
let citylocation213;
var currentLongitude = 168;
var targetLatitude = 0;
var targetLongitude = 0;

// Function to generate random latitude and longitude
function getRandomCoordinates() {
  const lat = Math.random() * 180 - 90; // Latitude between -90 and 90
  const lon = Math.random() * 360 - 180; // Longitude between -180 and 180
  return { lat, lon };
}
function beginRollRequest(nextcitlong, nextcitlat, nextnextcitlong, nextnextcitlat, elapse) {
  // Calculate the time to roll
  var timetoroll5 = (parseInt(elapse) / 3);
  var currentHeading5 = heading;
  var startPos = Cesium.Cartographic.fromDegrees(nextcitlong, nextcitlat, 40000);  // Adjust scale if needed
  var endPos = Cesium.Cartographic.fromDegrees(nextnextcitlong, nextnextcitlat, 40000);
  const maxRoll5 = Cesium.Math.toRadians(30);

  // Create a geodesic path between the start and end positions
  var geodesic9 = new Cesium.EllipsoidGeodesic(startPos, endPos);
  const currentHeadingRadians = Math.abs(currentHeading5);  // Default to 0 if undefined
  const targetHeading = geodesic9.startHeading;  // Default to 0 if undefined

        // Normalize angles to be in the range [-180, 180)
function normalizeAngle(angle) {
  return ((angle + 180) % 360) - 180;
}

// Calculate delta heading (shortest turn direction)
const deltaHeading = normalizeAngle(targetHeading + (3 * Math.PI / 2) );
  console.log("Timeout delay:", 2 * timetoroll5);

  const rollDirection = (deltaHeading> currentHeading5) ? maxRoll5 : -maxRoll5;

  // Set the timeout to delay the animation
  setTimeout(() => {
    console.log("Starting TweenLite animation after timeout...");
    
    // Start the TweenLite animation
    TweenLite.to({ progress: roll }, timetoroll5, {
      progress: rollDirection,  // Direction of the roll animation
      ease: Power1.easeIn,  // Smooth easing
      onUpdate: function () {
        roll = this.target.progress;  // Update the roll value during the animation
      },
      onComplete: function () {
        console.log("TweenLite animation complete.");
        alreadyrolled = false;  // Reset the flag after animation completes
      },
    });
  }, 2 * timetoroll5);  // Delay the start of the animation
}


// Add an entity with a 3D model positioned above the Earth's surface
var santa2 = viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(currentLongitude, currentLatitude, 40000), // 100 km above the surface
  id: "santa2",
  model: {
    uri: '/assets/againsanta.gltf',
    scale: 50.1 // Smaller scale
  },
  orientation: Cesium.Transforms.headingPitchRollQuaternion(Cesium.Cartesian3.fromDegrees(currentLongitude, currentLatitude, 40000), new Cesium.HeadingPitchRoll(0, 0, 0))
});


// Convert Unix timestamp to JulianDate
const startTime = Cesium.JulianDate.fromDate(new Date(currenttimeunixsec)); // Multiply by 1000 to convert seconds to milliseconds

// Configure the Clock
viewer.clock.startTime = startTime.clone(); // Set the start time
viewer.clock.currentTime = startTime.clone(); // Set the current time
viewer.clock.stopTime = Cesium.JulianDate.addSeconds(startTime, 3600, new Cesium.JulianDate()); // Add 1 hour for simulation
viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP; // Loop the clock at the stopTime
viewer.clock.multiplier = 1; // Normal speed (1 second per real-time second)
viewer.clock.shouldAnimate = true; // Start the clock animation// Start the clock animation
// Add an entity with a 3D model positioned above the Earth's surface
var santa = viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(currentLongitude, currentLatitude, 40000), // 100 km above the surface
  id: "santa",
  model: {
    uri: '/assets/invisible.glb',
    scale: 50.1 // Smaller scale
  },
  orientation: Cesium.Transforms.headingPitchRollQuaternion(Cesium.Cartesian3.fromDegrees(currentLongitude, currentLatitude, 40000), new Cesium.HeadingPitchRoll(0, 0, 0))
});
// Add an entity with a 3D model positioned above the Earth's surface
var northpole = viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(0, 90, 200), // 100 km above the surface
  id: "northpole",
  model: {
    uri: '/assets/npisland.gltf',
    scale: 90.1 // Smaller scale
  },
});
santa.allowPicking = false;
santa2.allowPicking = false;
let pitch = 0
let roll = 0;
let debounceTimeout;


/*let alreadydone2 = false;
setInterval(() => {
  if (!alreadydone2) {
    alreadydone2 = true;
    const frequency = 5; // Frequency of oscillation in Hz
    const amplitude = 0.08; // Amplitude of the oscillation

    TweenLite.to({ progress: 0 }, 1 / frequency, {  
      progress: 1, // Animate from 0 to 1  
      repeat: -1,  // Infinite repeat  
      yoyo: true,  // Oscillate back and forth  
      ease: Linear.easeNone, // Linear easing for consistent oscillation  
      onUpdate: function (tween) {    
        // Calculate pitch based on the current progress of the tween (ranges from -amplitude to +amplitude)    
        let pitch = amplitude * (tween.target.progress * 2 - 1); // Scales the progress to oscillate from -amplitude to +amplitude    
        console.log(pitch); // For debugging or visualization  
      },  
      onComplete: function () {    
        console.log("Oscillation cycle completed");  
        alreadydone2 = false; // Reset flag for next interval cycle  
      }
    });
  }
}, 50);

*/
// Configure the clock to loop continuously
viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
viewer.clock.multiplier = 1;
viewer.clock.shouldAnimate = true;
const scene = viewer.scene;
const frequency = 5; // Frequency of oscillation in Hz
const amplitude = 0.08; // Amplitude of the oscillation
// Define the updategraphics function (replace with your actual implementation)
function updategraphics(frontosc, heightosc, snow, water, hybrid, cameraeffects) {
  console.log("Graphics updated:");
  console.log("Front Oscillation:", frontosc);
  if (frontosc = 'false') {
    allowedtofrontoscilate = false
    height2 = 31000
  }
  console.log("Height Oscillation:", heightosc);
  allowedtotweenheight = Boolean(heightosc)
  console.log("Snow:", snow);

  console.log("Water:", water);
  if (Boolean(water) === false) {
    viewer.requestWaterMask = function() {
      console.log('requestWaterMask has been disabled.');
      // Optionally return a resolved promise or a default value if needed.
      return Promise.resolve(null);
    };
  } else {
    if (!viewer.requestWaterMask) {
      viewer.requestWaterMask
    }
  }
  console.log("Hybrid:", hybrid);
  if (Boolean(hybrid) === true) {
    // Add the Google Maps layer to Cesium's imagery layer collection
viewer.imageryLayers.addImageryProvider(googleMapsLayer);

  } else {
    // Add the Google Maps layer to Cesium's imagery layer collection
viewer.imageryLayers.remove(googleMapsLayer);
  }
  console.log("Camera Effects:", cameraeffects);
  if (Boolean(cameraeffects) === true) {
    allowedtocameraeffect = true;
    setTimeout(() => {
      Down3()
    }, 1000);
  } else {
    allowedtocameraeffect = false
  }
}

// Function to load settings and call updategraphics
function applyGraphicsSettings(settings) {
  updategraphics(
      settings["Santa Sleigh Front End Oscillation"],
      settings["Santa Sleigh Height Oscillation"],
      settings["Screen Snow"],
      settings["Animated Water"],
      settings["Google Hybrid"],
      settings["Camera Raises and Lowers with Sleigh"]
  );
}

// Load and apply settings on page load
document.addEventListener("DOMContentLoaded", () => {
  const settingsKey = "laginducedsettings";
  const savedSettings = JSON.parse(localStorage.getItem(settingsKey));

  if (savedSettings) {
      applyGraphicsSettings(savedSettings);
  }
});

// Listen for real-time changes in localStorage
window.addEventListener('storage', function(event) {
  if (event.key === "laginducedsettings") {
      const updatedSettings = JSON.parse(event.newValue);
      console.log("UPDATING KEYS")
      applyGraphicsSettings(updatedSettings); // Update graphics live
  }
});
let lastFrameTime = performance.now();
let frameCount = 0;

function checkFrameRate() {
  const now = performance.now();
  const delta = now - lastFrameTime;
  lastFrameTime = now;

  if (delta > 16.67) { // Target 60 FPS (~16.67 ms per frame)
    handleLowFramerate(20)
  }

  requestAnimationFrame(checkFrameRate);
}




// Function to handle low framerate
function handleLowFramerate(currentFps) {
  console.warn(`Framerate dropped below 20 FPS! Current FPS: ${currentFps}`);
  viewer.requestWaterMask = function() {
    console.log('requestWaterMask has been disabled.');
    // Optionally return a resolved promise or a default value if needed.
    return Promise.resolve(null);
  };
  allowedtotweenheight = false
  warnuserWarning(
    'Low Framerate Detected',
    `The tracker may be running slowly on your device. We automatically reverted to lower graphical settings for you.`
  );
}

function Up() {
  if (allowedtofrontoscilate === true && allowedtoheightincrease2 === true) {
  TweenLite.to({ progress: (amplitude*-1)/2 }, 5, {
    progress: amplitude*2, // From -amplitude to +amplitude
    ease: Power1.easeInOut, // Smooth easing
    onUpdate: function () {
      pitch = this.target.progress; // Update the pitch variable
    },
    onComplete: Down, // Start Down after Up finishes
  });
}}

function Down() {
  if (allowedtofrontoscilate === true && allowedtoheightincrease2 === true) {
  TweenLite.to({ progress: amplitude*2 }, 5, {
    progress: (amplitude*-1)/2, // From +amplitude to -amplitude
    ease: Power1.easeInOut, // Smooth easing
    onUpdate: function () {
      pitch = this.target.progress; // Update the pitch variable
    },
    onComplete: Up, // Start Up after Down finishes
  });
  }}
function Up2() {
  if (allowedtotweenheight === true && allowedtoheightincrease2 === true) {
  TweenLite.to({ progress: 13100 }, 5, {
    progress: 15100, // From -amplitude to +amplitude
    ease: Power1.easeInOut, // Smooth easing
    onUpdate: function () {
      height2 = this.target.progress; // Update the pitch variable
    },
    onComplete: Down2, // Start Down after Up finishes
  });
} else {
  height2 = 15100
}}

function Down2() {
  if (allowedtotweenheight === true && allowedtoheightincrease2 === true) {
  TweenLite.to({ progress: 15100 }, 5, {
    progress: 13100, // From +amplitude to -amplitude
    ease: Power1.easeInOut, // Smooth easing
    onUpdate: function () {
      height2 = this.target.progress; // Update the pitch variable
    },
    onComplete: Up2, // Start Up after Down finishes
  });
}else {
  height2 = 15100
}}
function Up3() {
  if (allowedtocameraeffect === true) {
  TweenLite.to({ progress: 13100 }, 5, {
    progress: 15100, // From -amplitude to +amplitude
    ease: Power1.easeInOut, // Smooth easing
    onUpdate: function () {
      height3 = this.target.progress; // Update the pitch variable
    },
    onComplete: Down3, // Start Down after Up finishes
  });
}}

function Down3() {
  if (allowedtocameraeffect === true) {
  TweenLite.to({ progress: 15100 }, 5, {
    progress: 13100, // From +amplitude to -amplitude
    ease: Power1.easeInOut, // Smooth easing
    onUpdate: function () {
      height3 = this.target.progress; // Update the pitch variable
    },
    onComplete: Up3, // Start Up after Down finishes
  });
}}

// Start the oscillation
Up();
setTimeout(() => {
  Up2()
}, 2200);


/*
// Create a BillboardCollection for the particles
// Function to update particle position with random colors
function updateParticles(particle, dt) {
  particle.color = Cesium.Color.fromRandom({ alpha: 1.0 });
}
// Function to create particle system
function createParticleSystem() {
  return new Cesium.ParticleSystem({
      image: '/assets/sparkle.png', // Ensure you have a particle image
      startColor: Cesium.Color.RED.withAlpha(0.7),
      endColor: Cesium.Color.BLUE.withAlpha(0.3),
      startScale: 1.0,
      endScale: 0.0,
      minimumParticleLife: 0.3, // Shorter lifetime
      maximumParticleLife: 0.3, // Shorter lifetime
      minimumSpeed: 1.0,
      maximumSpeed: 4.0,
      emissionRate: 100.0,
      imageSize: new Cesium.Cartesian2(25.0, 25.0),
      lifetime: 5.0,
      emitter: new Cesium.ConeEmitter(Cesium.Math.toRadians(45.0)), // Spread in an outward cone
      updateCallback: updateParticles,
  });
}

// Create and attach the particle system to the model
const particleSystem = createParticleSystem();
scene.primitives.add(particleSystem);

// Update the particle system's position to follow the model
viewer.clock.onTick.addEventListener(() => {
  const position = santa.position.getValue(viewer.clock.currentTime);
  particleSystem.modelMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
});
/* 
// Snow parameters
const snowParticleSize = 3.0;
const snowRadius = 100000.0;
const minimumSnowImageSize = new Cesium.Cartesian2(
    snowParticleSize,
    snowParticleSize
);
const maximumSnowImageSize = new Cesium.Cartesian2(
    snowParticleSize * 2.0,
    snowParticleSize * 2.0
);

let snowGravityScratch = new Cesium.Cartesian3();
const snowUpdate = function (particle, dt) {
    snowGravityScratch = Cesium.Cartesian3.normalize(
        particle.position,
        snowGravityScratch
    );
    Cesium.Cartesian3.multiplyByScalar(
        snowGravityScratch,
        Cesium.Math.randomBetween(-30.0, -30.0),
        snowGravityScratch
    );
    particle.velocity = Cesium.Cartesian3.add(
        particle.velocity,
        snowGravityScratch,
        particle.velocity
    );
    const distance = Cesium.Cartesian3.distance(
        scene.camera.position,
        particle.position
    );
    
        particle.endColor.alpha = 1.0 / (distance / snowRadius + 1.1);
    
};

function startSnow() {
    
    const snowSystem = new Cesium.ParticleSystem({
        modelMatrix: new Cesium.Matrix4.fromTranslation(scene.camera.position),
        minimumSpeed: -1.0,
        maximumSpeed: 0.0,
        lifetime: 4.0,
        emitter: new Cesium.SphereEmitter(snowRadius),
        startScale: 3,
        endScale: 1.0,
        image: "/assets/sparkle.png",
        emissionRate: 2000.0,
        startColor: Cesium.Color.WHITE.withAlpha(1.0),
        endColor: Cesium.Color.WHITE.withAlpha(1.0),
        minimumImageSize: minimumSnowImageSize,
        maximumImageSize: maximumSnowImageSize,
        updateCallback: snowUpdate,
    });
    scene.primitives.add(snowSystem);

    let position = santa.position.getValue(Cesium.JulianDate.fromDate(new Date(currenttimeunixsec)));

    viewer.clock.onTick.addEventListener(() => {
      const position = santa.position.getValue(viewer.clock.currentTime);
      snowSystem.modelMatrix = Cesium.Matrix4.fromTranslation(position);
    });
}
startSnow()
// Gravity function to make particles fall
function applyGravity(particle, dt) {
  const gravity = -9.8;
  particle.velocity.y += gravity * dt;
}*/


let currentPos
let heading;

let hasRun1234124514 = false;
// let santaorientation = Cesium.Transforms.headingPitchRollQuaternion(santa.position.getValue(Cesium.JulianDate.fromDate(new Date(currenttimeunixsec))), new Cesium.HeadingPitchRoll(0, 0, 0));
if (allowedtotrackedentity === true && trackeneityenabled === true) {
  viewer.trackedEntity = santa;
}
var allowedtofly2 = true;
var validStepSize;

var time12983748923714 = 0;
function startValidStepSize() {
  

}
function calculateCoordsAheadCesium(currentHeading, startLat, startLon) {
  /**
   * Calculate the coordinates of a point 100 meters ahead
   * from a starting point given a heading using Cesium.
   *
   * @param {number} currentHeading - Heading in degrees (0° is North, 90° is East).
   * @param {number} startLat - Starting latitude in decimal degrees.
   * @param {number} startLon - Starting longitude in decimal degrees.
   * @returns {Object} - An object with the new latitude and longitude { lat, lon }.
   */

  // Constants
  const distanceMeters = 100; // Fixed distance of 100 meters
  const earthRadius = 6371000; // Earth's radius in meters

  // Convert inputs to radians
  const headingRad = Cesium.Math.toRadians(currentHeading);
  const startCartographic = Cesium.Cartographic.fromDegrees(startLon, startLat);

  // Use Cesium's Cartographic and Ellipsoid methods
  const ellipsoid = Cesium.Ellipsoid.WGS84;
  const startCartesian = ellipsoid.cartographicToCartesian(startCartographic);
  const headingVector = new Cesium.Cartesian3(
      Math.cos(headingRad),
      Math.sin(headingRad),
      0
  );

  // Scale heading vector by the desired distance
  const displacement = Cesium.Cartesian3.multiplyByScalar(headingVector, distanceMeters, new Cesium.Cartesian3());
  const endCartesian = Cesium.Cartesian3.add(startCartesian, displacement, new Cesium.Cartesian3());
  const endCartographic = ellipsoid.cartesianToCartographic(endCartesian);

  // Convert result back to degrees
  const newLat = Cesium.Math.toDegrees(endCartographic.latitude);
  const newLon = Cesium.Math.toDegrees(endCartographic.longitude);

  return { lat: newLat, lon: newLon };
}

// Example usage
const result = calculateCoordsAheadCesium(90, 40.748817, -73.985428);
console.log(`New coordinates: Latitude ${result.lat}, Longitude ${result.lon}`);

let isTweening = false;
let allowedtoroll = true;

let hasrotatedyet = false;
// Update the camera orientation periodically
let hasRun1515 = false; // Flag to track if the code has been executed
function flyToSanta(lat, lng, time, city, lng2, lat2, elv1, elv2, starttime, endtime) {
  hasrotatedyet = false;
  //console.log("FLYING")
  if (typeof time !== 'number' || time <= 0) {
    console.error('Invalid time value');
    return;
  }

  var citylocation = city
  var start = Cesium.JulianDate.fromDate(new Date(currenttimeunixsec)); // Current time
  var stop = Cesium.JulianDate.addSeconds(start, time, new Cesium.JulianDate()); // Time after the specified duration
  var startValue;
  // Calculate the total number of steps based on the desired frequency (e.g., 60 steps per second)
  var totalSteps = time * 60;
  var totalSteps2;
  var posStepCounter = 0; // New step counter for currentPos
  var hasPosCounterStarted = false; // Flag to track when posStepCounter starts

  // Calculate the start and end positions
  var startPos = Cesium.Cartographic.fromDegrees(lng2, lat2, elv2 * 40000);
  var endPos = Cesium.Cartographic.fromDegrees(lng, lat, elv1 * 40000);

  // Create a geodesic path between the start and end positions
  var geodesic = new Cesium.EllipsoidGeodesic(startPos, endPos);
  // Initialize the orientation to 0
  var geodesic2;
  var i = 0; // Initialize step counter
  if (!hasRun1515) {
    // Initialize variables

    var currentNum = Math.floor(currenttimeunixsec / 1000);

    const startcount = 0;
    const endcount = 1;
  //  console.log("______________________________")
  //  console.log(starttime)
  //  console.log(currentNum)
  //  console.log(endtime)
    // Calculate the percentage to start the tween
    const percentage = findPercentage(starttime, currentNum, endtime);
  //  console.log(percentage)
    startValue = startcount + ((endcount - startcount) * (percentage / 100));
    prog1 = startValue
    prog1set = false
    heading = (geodesic.startHeading) + (3 * Math.PI / 2);
    hasRun1515 = true; // Set the flag to true after execution
  }

  var intervalId = setInterval(function () {

    if (i > totalSteps) {
      clearInterval(intervalId); // Stop the interval when the time has elapsed
    } else {
      if (city === citylocation213) {
        var currentStepSize = i / totalSteps;
        function updateHeading2(progress) {
          // Turn left (negative direction)
          heading = progress;
          //  updateCameraOrientation(-headingIncrement)

        }
        // Function to update positions based on tween progress
        function updatePosition(progress) {
          // Interpolate position based on progress (0 to 1)
          var currentPos = geodesic.interpolateUsingFraction(progress);

          // Ensure currentPos is defined
          if (!currentPos) {
            console.error('currentPos is undefined at progress:', progress);
            return; // Exit if currentPos is undefined
          }

          // Convert to Cartesian coordinates with a fixed altitude of 15,080 meters (10 km above the surface)
          var cartesianPosition = Cesium.Cartesian3.fromRadians(
            currentPos.longitude,
            currentPos.latitude,
            height3 // Altitude in meters
          );
          // Convert to Cartesian coordinates with a fixed altitude of 15,080 meters (10 km above the surface)
          var cartesianPosition2 = Cesium.Cartesian3.fromRadians(
            currentPos.longitude,
            currentPos.latitude,
            height2 // Altitude in meters
          );

          // Update positions of Santa and overlays
          santa.position = cartesianPosition;
          santa2.position = cartesianPosition2; // Update second Santa model if necessary
          santaOverlay.position = cartesianPosition; // Update overlay position if needed
        }
        if (!isTweening) {
          isTweening = true
          if (prog1set === true) {

            prog1 = 0;
          }
          if (activelyturning === false) {
          // Start the tween animation
         // console.log("TWEEN STARTING");
          allowedtoroll = false;
          TweenLite.to({ progress: prog1 }, actualtime, {
            progress: 1, // Animate from 0 to 1
            ease: Linear.easeInOut, // Ensure linear progression over time
            onUpdate: function () {
              if (isheadingrn === false) {
                // Convert Santa's position from Cartesian3 to Cartographic
                var cartesianPosition = santa.position.getValue(Cesium.JulianDate.fromDate(new Date(currenttimeunixsec)));
                var cartographic = Cesium.Ellipsoid.WGS84.cartesianToCartographic(cartesianPosition);

                // Convert to degrees for latitude and longitude, and meters for elevation
                var lng3 = Cesium.Math.toDegrees(cartographic.longitude); // Santa's current longitude
                var lat3 = Cesium.Math.toDegrees(cartographic.latitude);  // Santa's current latitude
                var elv3 = cartographic.height;                           // Santa's current elevation

                // Create Cartographic for the start position
                var startPos2 = Cesium.Cartographic.fromDegrees(lng3, lat3, elv3);

                // Assuming `endPos` is a valid Cartographic destination
                var geodesic5 = new Cesium.EllipsoidGeodesic(startPos2, endPos);

                // Calculate heading from the geodesic
                heading = geodesic5.startHeading + (3 * Math.PI / 2); // Heading in radians

                //console.log("Heading (radians):", heading);
                //console.log("Heading (degrees):", Cesium.Math.toDegrees(heading));


              }
              updatePosition(this.target.progress); // Update Santa's position based on tween progress
            },
            onComplete: function () {
              //console.log('Flight to target completed');
              isTweening = false; // Reset flag when the tween completes

              allowedtohead = true;
              allowedtoroll = true;
            }
          });
        }}
        // Calculate a new roll based on the current step



        //console.warn(actualstepsize)
        // console.warn(totalSteps)
        //console.warn(totalSteps2)
        // If allowedtofly2 is true and posStepCounter has started, update position




        // Convert the interpolated position to Cartesian coordinates and add the altitude

        // Get the initial heading

        // Set Santa's orientation
        // Current heading is already in radians
        var currentHeading = heading;

        // Goal heading calculation (keep everything in radians)
        var goalHeading = geodesic.startHeading;

        // Calculate the shortest path to the goal heading (left or right)
        var headingDifference = goalHeading - currentHeading;

        // Normalize headingDifference to be within -π and π (i.e., shortest path)


        // Adjust heading by a small increment in radians
        var headingIncrement = Cesium.Math.toRadians(0.864699); // Increment of ~0.001 rad
        var rollIncrement = Cesium.Math.toRadians(0.0015); // Roll increment in radians
        var bufferRange = Cesium.Math.toRadians(3); // Buffer range of 1.5 degrees in radians
        const maxRoll = Cesium.Math.toRadians(30); // Maximum roll in radians
        const rollSpeed = 0.015; // Adjust this value for how quickly it rolls
        //console.log("CALC TO HEADING")
        //console.log(heading)
        // Update the heading variable based on the heading difference

        if (Math.abs(headingDifference) > bufferRange && allowedtohead === true) { // Check if adjustment is needed
          if (!isheadingchanging && !hasrotatedyet) {
            isheadingrn = true
            hasrotatedyet = true
            const currentHeadingRadians = Math.abs(currentHeading)// Default to 0 if undefined

const targetHeading = geodesic.startHeading;

// Normalize the angle to the range [-pi, pi) in radians
function normalizeAngleRadians(angle) {
  return ((angle + Math.PI) % (2 * Math.PI)) - Math.PI;
}

// Function to calculate the shortest angle difference with clockwise priority
function shortestAngleDifference(current, target) {
  const normalizedCurrent = normalizeAngleRadians(current);
  const normalizedTarget = normalizeAngleRadians(target);
  let diff = normalizedTarget - normalizedCurrent;

  // Wrap angle difference to the range [-pi, pi)
  diff = normalizeAngleRadians(diff);

  // Clockwise distance
  const clockwise = diff >= 0 ? diff : 2 * Math.PI + diff;

  // Counterclockwise distance
  const counterclockwise = diff <= 0 ? -diff : 2 * Math.PI - diff;

  // Choose the smaller distance; prioritize clockwise when equal
  return clockwise <= counterclockwise ? clockwise : -counterclockwise;
}

// Normalize the current and target headings
const normalizedCurrentHeading = normalizeAngleRadians(currentHeading);
const normalizedTargetHeading = normalizeAngleRadians(targetHeading);

// Adjust the target heading by adding 270 degrees (3 * pi / 2 radians)
const adjustedHeading = normalizedTargetHeading + (3 * Math.PI / 2);

// Normalize the adjusted heading
const normalizedAdjustedHeading = normalizeAngleRadians(adjustedHeading);

// Calculate the shortest angle difference, prioritizing clockwise direction
const shortestDelta = shortestAngleDifference(normalizedCurrentHeading, normalizedAdjustedHeading);

// Update the heading for tweening
const updatedHeading = normalizedCurrentHeading + shortestDelta;

// Log the results for debugging
console.log("Normalized Current Heading:", normalizedCurrentHeading);
console.log("Normalized Target Heading:", normalizedTargetHeading);
console.log("Normalized Adjusted Heading:", normalizedAdjustedHeading);
console.log("Shortest Angle Difference (clockwise prioritized):", shortestDelta);
console.log("Updated Heading (radians):", updatedHeading);

// Use the shortest delta for tweening
// Example: TweenLite.to(object, duration, { rotation: updatedHeading });


// Use the shortest delta for tweening
// Example: TweenLite.to(object, duration, { rotation: updatedHeading });


// Use shortestDelta with TweenLite for smooth animation
// Example: TweenLite.to(object, duration, { rotation: currentHeading + shortestDelta });

            const rollDirection = (updatedHeading  > normalizedCurrentHeading) ? maxRoll : -maxRoll;
            isheadingchanging = true;

            const turnTime = 4

            // Speed of movement per interval (meters per second or any other unit you choose)
            const speed = 10;  // Example: 10 meters per second

            // Function to update model position
            function moveModelForward() {
              if (isTweening === false) {

                // Create a unit vector pointing in the direction of the heading (2D direction on the ground)
                const direction = new Cesium.Cartesian3(
                  Math.sin(heading),  // X component (East-West direction)
                  Math.cos(heading),  // Y component (North-South direction)
                  0                   // Z component is 0 for flat movement on the ground
                );

                // Normalize the direction vector and scale it by speed (movement per second)
                Cesium.Cartesian3.normalize(direction, direction);
                Cesium.Cartesian3.multiplyByScalar(direction, speed, direction);

                // Update the model's position based on the direction
                santa.position = Cesium.Cartesian3.add(santa.position, direction, new Cesium.Cartesian3());
                santa2.position = Cesium.Cartesian3.add(santa2.position, direction, new Cesium.Cartesian3());
              }
            }

            // Interval to update model position every 100ms (10 times per second)

            function resetRoll() {
              TweenLite.to({ progress: roll }, 1, {
                progress: 0,
                ease: Linear.easeInOut,
                onUpdate: function () {
                  updateRoll(this.target.progress);
                },
                onComplete: function () {
                  isheadingrn = false
                  console.log("Roll reset completed");
                },
              });
            }
            // Animate roll adjustment for the turn
            TweenLite.to({ progress: roll }, 1, {
              progress: rollDirection,
              ease: Linear.easeInOut,
              onUpdate: function () {
                updateRoll(this.target.progress);
              },

            });
            console.log("Current Heading (radians):", currentHeadingRadians);
            console.log("Target Heading (radians):", targetHeading);

            TweenLite.to({ progress: normalizedCurrentHeading }, turnTime, {
              progress: updatedHeading,
              ease: Linear.easeInOut,
              onUpdate: function () {
                // Increment the heading smoothly
                const incrementalHeading = this.target.progress;
                const boundedHeading = (incrementalHeading); // Normalize radians to [0, 2π]

                heading = boundedHeading; // Update the Santa entity's heading
                console.log("Updated Heading (radians):", boundedHeading);
              },
              onComplete: function () {
                console.log("Heading adjustment completed");
                resetRoll();
                isheadingchanging = false;
              }
            });

            // Rolling logic - Calculate roll direction (always consistent)



          }




         
        } else {
          return;
        }

      } }
    }, time * 1000 / totalSteps); // Interval time in milliseconds
    


  // Make sure Santa is visible

  // Make sure the viewer is tracking Santa
  if (allowedtotrackedentity === true && trackeneityenabled === true) {
    viewer.trackedEntity = santa;
  }
}


function myFunctio2() {
  // Get the current time in JulianDate format
  var start = Cesium.JulianDate.fromDate(new Date(currenttimeunixsec)); 

  // Update orientations for the entities
  santa2.orientation = Cesium.Transforms.headingPitchRollQuaternion(
    santa2.position.getValue(start),
    new Cesium.HeadingPitchRoll(heading, pitch, roll)
  );

  santa.orientation = Cesium.Transforms.headingPitchRollQuaternion(
    santa.position.getValue(start),
    new Cesium.HeadingPitchRoll(heading, pitch, roll)
  );

  santaOverlay.orientation = Cesium.Transforms.headingPitchRollQuaternion(
    santa.position.getValue(start),
    new Cesium.HeadingPitchRoll(heading, pitch, roll)
  );
}

// Add the function to the Cesium render loop
viewer.scene.preRender.addEventListener(myFunctio2);


var nobaskets = url.searchParams.get("nobaskets");
if (nobaskets === "1") {
  //console.log("NO BASKETS");
} else {
  fetchBaskets(); // Fetch all baskets onload
}

async function fetchBaskets() {
  try {
    const response = await fetch("/getbaskets");
    const data = await response.json();

    if (data.length === 0) {
      basketsfoundyet = false
      // Run the function if the baskets are empty
      return; // Exit the function early if there are no baskets
    }

    // Process the baskets if they are not empty
    data.forEach((basket) => {
      addBasket(basket);
    });
  } catch (error) {
    console.error("Error fetching baskets:", error);
    warnuserError("Error", "There was an error getting old gifts delivered.");
  }
}


// Define an array to store the coordinates of already placed baskets


// Function to convert Celsius to Fahrenheit
function celsiusToFahrenheit(celsius) {
  return (celsius * 9 / 5) + 32;
}

// Function to truncate the Wikipedia attribute if it exceeds 60 characters
function truncateText(text, maxLength) {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }
  return text;
}

// Function to round the weather data to three decimal places
function roundToThreeDecimalPlaces(value) {
  return parseFloat(value).toFixed(1);
}
// Disable default double-click action (untracking)
viewer.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
// Create a BillboardCollection to manage multiple billboards
// Streamlined billboard handling script

// Create a BillboardCollection to manage multiple billboards
const billboardCollection = new Cesium.BillboardCollection({
  scene: viewer.scene,
});
viewer.scene.primitives.add(billboardCollection);

// Utility function to add a basket (billboard) to the collection
function addBasket(cityInfo) {
  if (cityInfo.country !== "pt") {
    // Prevent duplicates based on coordinates
    const isAlreadyPlaced = placedBaskets.some(
      coords => coords[0] === cityInfo.latitude && coords[1] === cityInfo.longitude
    );
    if (isAlreadyPlaced) return;
let height5555 = 15190
if (cityInfo.city === "International Space Station") {
  height5555 = 300100
}
    placedBaskets.push([cityInfo.latitude, cityInfo.longitude]);

    const wikipediaLink = cityInfo.Wikipedia_attr || "";
    const isYouTubeLink = wikipediaLink.includes("youtube.com");
    var iconImage = isYouTubeLink ? '/assets/camera.png' : '/assets/present.png';
if (height5555 === 300100) {
  iconImage = "/assets/isspresent.png"
}
    const billboard = billboardCollection.add({
      position: Cesium.Cartesian3.fromDegrees(cityInfo.longitude, cityInfo.latitude, height5555),
      image: iconImage,
      scale: 0.1,
    });

    billboard.cityInfo = cityInfo; // Attach city data for reference
  }
}
// Disable auto sleep in TweenLite (same ticker control as GSAP)
TweenLite.ticker.autoSleep = false;

// Utility function to add an inactive basket
function addBasketInactive(cityInfo) {
  if (cityInfo.country !== "pt" && cityInfo["Unix Arrival Arrival"]) {
    const isAlreadyPlaced = placedBaskets.some(
      coords => coords[0] === cityInfo.Latitude && coords[1] === cityInfo.Longitude
    );
    if (isAlreadyPlaced) return;
    let height5555 = 15190
    if (cityInfo.city === "International Space Station") {
      height5555 = 300100
    }
    placedBaskets.push([cityInfo.Latitude, cityInfo.Longitude]);

    const wikipediaLink = cityInfo["Wikipedia attr"] || "";
    const isYouTubeLink = wikipediaLink.includes("youtube.com");
    var iconImage = isYouTubeLink ? '/assets/camera.png' : '/assets/present.png';
if (height5555 === 300100) {
  iconImage = "/assets/isspresent.png"
}
    const billboard = billboardCollection.add({
      position: Cesium.Cartesian3.fromDegrees(cityInfo.Longitude, cityInfo.Latitude, height5555),
      image: iconImage,
      scale: 0.1,
    });

    billboard.cityInfo = cityInfo;
  }
}

// Function to show a centered popup
function showPopup(content) {
  const popupContainer = document.getElementById('popup-container');
  const popupContent = document.getElementById('popup-content');
  popupContent.innerHTML = content;
  popupContainer.style.display = 'block';
  popupContainer.style.zIndex = '999999';
  popupContainer.style.left = '50%';
  popupContainer.style.top = '50%';
  popupContainer.style.transform = 'translate(-50%, -50%)';

  document.getElementById('close-btn').onclick = () => {
    popupContainer.style.display = 'none';
  };
}

// Event listener for clicks on billboards
const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
handler.setInputAction(function (event) {
  const pickedObject = viewer.scene.pick(event.position);
  if (Cesium.defined(pickedObject) && pickedObject.primitive instanceof Cesium.Billboard) {
    const billboard = pickedObject.primitive;
    const cityInfo = billboard.cityInfo;

    const popupContent = `
      <div style="font-family: Arial, sans-serif; color: #fff; background: #333; padding: 10px; border-radius: 8px;">
        <div style="display: flex; align-items: center; margin-bottom: 10px;">
          <img src="${getFlagImageUrl(cityInfo.cc)}" width="20px" style="margin-right: 10px;">
          <b>${cityInfo.city}, ${cityInfo.country}</b>
        </div>
        <div><strong>Arrival Time:</strong> ${new Date(cityInfo.unixdeparture * 1000).toLocaleString()}</div>
        <div>
          <a href="${cityInfo.Wikipedia_attr}" target="_blank" style="color: #007BFF; text-decoration: none;">
            More Info
          </a>
        </div>
      </div>`;

    showPopup(popupContent);
  }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);



// CSS for custom popup styling
/*
#popup-container {
  position: absolute;
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: none;
}

#popup-content {
  font-family: Arial, sans-serif;
}

#close-btn {
  position: absolute;
  top: 5px;
  right: 5px;
  cursor: pointer;
}
*/




let lastcitystopped;
async function getTimeUntilArrival(latitude, longitude) {
  try {
    const response = await fetch(`/gettimeofarrival?lat=${latitude}&long=${longitude}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting time until arrival:', error);

    warnuserError("Error", "There was an error fetching the time until arrival.")
    return null;
  }
}

function formatArrivalTime(unixArrivalTime) {
  let timeLeft = unixArrivalTime - (currenttimeunixsec/1000); // Time difference to arrival time
  
  const hours = timeLeft / 3600;

  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    if (minutes < 15) {
      return `Less than 15 minutes!`;
    } else if (minutes % 15 === 0) {
      return `${minutes / 60} hours`;
    } else {
      // Find the nearest quarter hour and express the fraction properly
      const nearestQuarter = Math.round(minutes / 15);
      if (nearestQuarter === 1) {
        return `¼ hours`;
      } else if (nearestQuarter === 2) {
        return `½ hours`;
      } else if (nearestQuarter === 3) {
        return `¾ hours`;
      } else {
        return `${nearestQuarter}/4 hours`;  // You can leave this as a fraction if needed
      }
    }
  } else if (hours === 1) {
    return `1 hour`;
  } else {
    const wholeHours = Math.floor(hours);
    const remainingMinutes = Math.round((hours - wholeHours) * 60);

    let fraction = '';
    if (remainingMinutes === 0) {
      fraction = `${wholeHours} ${wholeHours === 1 ? 'hour' : 'hours'}`;
    } else if (remainingMinutes === 15) {
      fraction = `${wholeHours} ¼ hours`;
    } else if (remainingMinutes === 30) {
      fraction = `${wholeHours} ½ hours`;
    } else if (remainingMinutes === 45) {
      fraction = `${wholeHours} ¾ hours`;
    } else {
      const nearestQuarter = Math.round(remainingMinutes / 15);
      if (nearestQuarter === 1) {
        fraction = `${wholeHours} ¼ hours`;
      } else if (nearestQuarter === 2) {
        fraction = `${wholeHours} ½ hours`;
      } else if (nearestQuarter === 3) {
        fraction = `${wholeHours} ¾ hours`;
      } else {
        fraction = `${wholeHours} hours`; // No fraction for whole hours
      }
    }

    return fraction;
  }
}

// future map.getzoom
async function main() {
  updateweatherinfo()
  try {
    // Get latitude and longitude from client's IP address
    const { latitude, longitude } = await getLatLongFromIPAddress();

    if (latitude && longitude) {
      // Get time of arrival from server
      const { nearestCity, timeUntilArrival } = await getTimeUntilArrival(latitude, longitude); // Change to arrivalTime
      
      localStorage.setItem('nearestcity', nearestCity);
      
      // Update HTML elements with the obtained information
      const arrivalInfoElement = document.getElementById('arrivalTime');
      if (timeUntilArrival >= (currenttimeunixsec/1000)) {
        // Arrival time is in the future (Santa will arrive in)
        arrivalInfoElement.innerText = `Santa will arrive in: ${formatArrivalTime(timeUntilArrival)}`;
      } else {
        // Arrival time is in the past (Santa arrived at)
        const arrivalDate = new Date(timeUntilArrival * 1000); // Convert to Date object
        const longDateTime = arrivalDate.toLocaleString('en-US', {
          weekday: 'long', // Full name of the day
          year: 'numeric', // Full year
          month: 'long',   // Full name of the month
          day: 'numeric',  // Day of the month
          hour: 'numeric', // Hour
          minute: 'numeric', // Minute
          second: 'numeric', // Second
          hour12: true       // 12-hour clock (set to false for 24-hour)
        });
        const formattedArrivalTime = arrivalDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        
        document.getElementById("arrivalTime2").innerText = `${longDateTime} in ${nearestCity}`

        arrivalInfoElement.innerText = `Santa arrived at: ${formattedArrivalTime}`;
      }
setInterval(() => {
  
      if (timeUntilArrival >= (currenttimeunixsec/1000)) {
        // Arrival time is in the future (Santa will arrive in)
        arrivalInfoElement.innerText = `Santa will arrive in: ${formatArrivalTime(timeUntilArrival)}`;
      } else {
        // Arrival time is in the past (Santa arrived at)
        const arrivalDate = new Date(timeUntilArrival * 1000); // Convert to Date object
        const longDateTime = arrivalDate.toLocaleString('en-US', {
          weekday: 'long', // Full name of the day
          year: 'numeric', // Full year
          month: 'long',   // Full name of the month
          day: 'numeric',  // Day of the month
          hour: 'numeric', // Hour
          minute: 'numeric', // Minute
          second: 'numeric', // Second
          hour12: true       // 12-hour clock (set to false for 24-hour)
        });
        const formattedArrivalTime = arrivalDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        
        rmattedArrivalTime = arrivalDate.toLocaleString(); // Format the time
        document.getElementById("arrivalTime2").innerText = `${longDateTime} in ${nearestCity}`
        arrivalInfoElement.innerText = `Santa arrived at: ${formattedArrivalTime}`;
      }
    }, 60000);
    } else {
      console.error('Latitude and longitude not available.');
    }
  } catch (error) {
    console.error('An error occurred:', error);

    warnuserError("Error", "There was an error getting data for arrival time.");
  }
}

// Call the main function initially
main();





async function fetchRouteData() {
  try {
    const response = await fetch("/getbaskets");
    const data = await response.json();

    if (data.length < 2) {
      basketsfoundyet = false
      // Run the function if the baskets are empty


    }


  } catch (error) {
    console.error("Error fetching baskets:", error);

  }
  try {
    const response = await fetch('/route'); // Replace with your actual endpoint
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }

    const data = await response.text(); // Get response as text first
    //console.log('Response Data:', data); // Log the raw response
    setInterval(() => {

      // Parse the route data
      const routeData = parseRouteData(data); // Convert to appropriate format

      // Process the route data to fit the expected SSE format
      const processedData = processRouteData(routeData);

      // Call handleSSE with the processed data
      handleSSE(processedData);
    }, 1000);
  } catch (error) {
    console.error('Error fetching route data:', error);

    warnuserError("Error", "There was an error getting the route data.")
  }
}

// Function to align execution to the next whole second
function runFetchAtNextSecond() {
  
    fetchRouteData();
  
}

// Start the fetching process
runFetchAtNextSecond();

let hasHandledNoNextCity = false; // Flag to track if handleNoNextCity has run

function parseRouteData(data) {
  try {
    // Assuming the data is in a JSON format, adjust as necessary
    return JSON.parse(data); // Adjust to JSON or appropriate parsing method
  } catch (error) {
    console.error('Error parsing route data:', error);

    warnuserError("Error", "There was an error parsing the route data.")
    return []; // Return an empty array on error
  }
}
var ISS;
let hasStarted = false; // Flag to track if startview has run
function processRouteData(routeData) {
  const currentUnixTime = Math.floor(currenttimeunixsec / 1000); // Current time in seconds
  let nextCity = null;
  let currentCity = null;
  let lastCity = null;
  let nextNextCity = null;
  // Process route data to find next, nextNext, and current cities
  for (let i = 0; i < routeData.length; i++) {
    const stop = routeData[i];
    const unixArrival = stop["Unix Arrival Arrival"];

    // Skip empty or invalid entries
    if (!unixArrival || isNaN(unixArrival)) {

      continue
    }

    // Update lastCity to currentCity before checking next conditions
    if (currentCity) {
      lastCity = currentCity; // Store the last seen city
    }

    // Check if the arrival time is in the future
    if (unixArrival > currentUnixTime) {
      nextCity = stop; // Found the next city
      if (!currentCity) {
        currentCity = stop; // Set currentCity to the nextCity if currentCity is not set
      }

      // Check if there is a city after the next city
      if (i + 1 < routeData.length) {
        const nextStop = routeData[i + 1];
        nextNextCity = nextStop; // Set the next city after the next one
      }
      break; // Exit loop once nextCity is found
    } else {
      if (basketsfoundyet === false) {
        addBasketInactive(stop)
      }
    }

    // Always update currentCity
    currentCity = stop; // Update current city
  }

  // If no nextCity is found, we can consider currentCity as the last one seen
  if (!nextCity && currentCity) {
    lastCity = currentCity; // Update lastCity to the last known currentCity
  }

  if (nextCity && !hasStarted) {
    startallowed = true;
    startview();
    hasStarted = true; // Set the flag to true after running startview
  }

  // If no current city is found, set it to an empty object
  currentCity = currentCity || {};

  

  // Check if nextCity is not found and call a custom function
  if (!nextCity) {
    ended2 = true
    // If time left is more than 1 hour, hide the elements
    document.getElementById('endingtext').style.visibility = "visible";
    document.getElementById('hideavailable').style.visibility = "hidden";
    document.getElementById('lastseeninfobox').style.visibility = "hidden";
    document.getElementById('lastseeninfobox3').style.visibility = "hidden";
    deleteEntityById(viewer, 'santa');
    deleteEntityById(viewer, 'santa2');

    if (!hasHandledNoNextCity) {
      hasHandledNoNextCity = true; // Set the flag to true after running
      startallowed = false;
      handleNoNextCity(); // Call your function of choice
    }
    setInterval(() => {
      deleteEntityById(viewer, 'santa');
      deleteEntityById(viewer, 'santa2');
      deleteEntityById(viewer, 'santaoverlaythingy');
    }, 1000);
  }

  // Convert to desired format
  return convertData({
    currentCity: extractCityData(currentCity),
    timeLeft: calculateTimeLeft(nextCity), // Ensure this function handles undefined nextCity
    nextCity: extractCityData(nextCity || currentCity), // Use nextCity if available
    nextNextCity: extractCityData(nextNextCity || currentCity), // Use nextCity if available
    lastCity: extractCityData(lastCity),
    newBasket: extractCityData(currentCity) // Assuming this should reflect currentCity
  });
}
function updateweatherinfo() {
 document.getElementById("weatheronarrival").innerText = "We're working on getting this information, please bear with us.";

setTimeout(() => {
  document.getElementById("weatheronarrival").innerText = "This will only take a few moments.";

  // Get the city from localStorage
  const city = localStorage.getItem("nearestcity");

  if (city) {
    // Fetch weather data for the city
    fetch(`/getweatherfromcity?city=${city}`)
      .then(response => response.json())
      .then(data => {
        // Get weather information
        const { city, country, weather } = data;
        const temperature = weather.temperature;
        const description = weather.description;

        // Convert temperature to local units if necessary (assuming Celsius to Fahrenheit here)
        const temperatureInFahrenheit = (temperature * 9/5) + 32;
        const temperatureText = `${temperatureInFahrenheit.toFixed(2)}°F`;

        // Update the message with the weather information
        document.getElementById("weatheronarrival").innerText = `In ${city}, ${country}, it was ${temperatureText} with ${description}.`;
      })
      .catch(err => {
        console.error("Error fetching weather data:", err);
        document.getElementById("weatheronarrival").innerText = "Sorry, we couldn't retrieve the weather data at this time.";
      });
  } else {
    document.getElementById("weatheronarrival").innerText = "City not found in localStorage.";
  }
}, 100);
}
let latatat = 0
let longonon = 0
let height666666 = 5000000
// Example function to be called if no next city is found
function handleNoNextCity() {
  //console.log("No next city found. Executing custom function.");
  allowedtotrackedentity = false
  updateweatherinfo()
  document.getElementById("followbutton").hidden = true
  const hidornot = localStorage.getItem('locationHid');
  const locallat = localStorage.getItem('longitude');
  const locallong = localStorage.getItem('latitude');
  if (hidornot === 'false' || !hidornot && locallat && locallong) {
    latatat = locallong
    longonon = locallat
    height666666 = 250000
  }
  trackeneityenabled = false
  viewer.trackedEntity = undefined; // Stop tracking the entity
  setTimeout(() => {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(longonon, latatat, height666666), // Center of the globe at a high altitude
      duration: 3 // Duration of the fly-to animation in seconds
    });

  }, 1000);
  setTimeout(() => {

    deleteEntityById(viewer, 'santaOverlay');
  }, 10000);
  // Add your custom logic here
}

let obj = {
  trackeneityenabled: false
};

const handler2 = {
  set(target, prop, value) {
    if (prop === 'trackeneityenabled') {
      console.log(`trackeneityenabled changed to ${value}`);
      // Call your custom functions here
      if (value) {
        console.log("track enabled")
      } else {
        disableTracking();
      }
    }
    target[prop] = value;
    return true;
  }
};

function updatelocationsettings() {
  const hidornot = localStorage.getItem('locationHid');
  if (hidornot === 'true') {
document.getElementById("hidelocation").hidden = true
document.getElementById("hidelocation2").hidden = true
  } else if (hidornot === 'false') {
    document.getElementById("hidelocation").hidden = false
    document.getElementById("hidelocation2").hidden = false

  }
}

const proxy = new Proxy(obj, handler2);
// Listen for changes in localStorage and update inputs accordingly
window.addEventListener('storage', function(event) {
  if (event.key === 'longitude' || event.key === 'latitude' || event.key === 'nearestcity') {
    main()
  }
  if (event.key === "locationHid") {
    updatelocationsettings()
  }
});
updatelocationsettings()

function disableTracking() {
  viewer.trackedEntity = undefined; // Stop tracking the entity
  setTimeout(() => {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(0.0, 0.0, 1500000.0), // Center of the globe at a high altitude
      duration: 3 // Duration of the fly-to animation in seconds
    });

  }, 1000);
}
function triggerFunctions() {
  // Add your functions here
  if (trackeneityenabled === true) {
    trackeneityenabled = false
    document.getElementById("FollowButtonImage").src = "/assets/followcam.png"
    disableTracking()
  } else {
    document.getElementById("FollowButtonImage").src = "/assets/unfollowicon.png"
    trackeneityenabled = true

    viewer.trackedEntity = santa;

  }
}


function extractCityData(city) {
  //console.log('City Data:', city); // Log the incoming city data for verification
  return {
    unixArrivalArrival: city["Unix Arrival Arrival"] || 0, // Default to 0 if not present
    unixArrival: city["Unix Arrival"] || 0, // Default to 0 if not present
    unixDeparture: city["Unix Departure"] || 0, // Adjusted from "Unix Arrival Departure" to "Unix Departure"
    city: city["City"] || "Unknown", // Default to "Unknown" if not present
    country: city["Region"] || "Unknown", // Changed from "Country" to "Region"
    cc: city["CC"] || "None", // Default to "None" if not present
    timezone: city["Timezone"] || "Unknown", // Default to "Unknown" if not present
    basketsdelivered: city["Eggs Delivered"] || 0, // Default to 0 if not present
    carrotsEaten: city["Carrots eaten"] || 0, // Default to 0 if not present
    latitude: city["Latitude"] || "0", // Default to "0" if not present
    longitude: city["Longitude"] || "0", // Default to "0" if not present
    popNum: city["Population Num"] || 0, // Default to 0 if not present
    popYear: city["Population Year"] || "Unknown", // Default to "Unknown" if not present
    elevationMeter: city["Elevation Meter"] || 0, // Default to 0 if not present
    arrivalStoppageTime: city["Arrival Stoppage Time"] || 0, // Default to 0 if not present
    wikipediaAttr: city["Wikipedia attr"] || "None", // Default to "None" if not present
    wikipediaLink: city["Wikipedia Link"] || "None" // Default to "None" if not present
  };
}


function calculateTimeLeft(nextCity) {
  const nextArrival = nextCity ? nextCity["Unix Arrival Arrival"] : 0; // Adjust to match your data structure
  return nextArrival - Math.floor(currenttimeunixsec / 1000); // Return the time left until the next city arrives
}

function convertData(inputData) {
  return {
    currentCity: {
      unixarrivalarrival: inputData.currentCity.unixArrivalArrival,
      unixarrival: inputData.currentCity.unixArrival,
      unixdeparture: inputData.currentCity.unixDeparture,
      city: inputData.currentCity.city,
      country: inputData.currentCity.country,
      cc: inputData.currentCity.cc,
      timezone1: inputData.currentCity.timezone,
      basketsdelivered: inputData.currentCity.basketsdelivered, // Change to baskets delivered
      carrots_eaten: inputData.currentCity.carrotsEaten, // Change to carrots eaten
      latitude: inputData.currentCity.latitude,
      longitude: inputData.currentCity.longitude,
      pop_num: inputData.currentCity.popNum, // Change to population number
      pop_year: inputData.currentCity.popYear, // Change to population year
      Elevation_Meter: inputData.currentCity.elevationMeter, // Change to elevation meter
      Arrival_Stoppage_Time: inputData.currentCity.arrivalStoppageTime, // Change to arrival stoppage time
      timezone: inputData.currentCity.timezone,
      Wikipedia_attr: inputData.currentCity.wikipediaAttr,
      wikipedia_link: inputData.currentCity.wikipediaLink
    },
    timeLeft: inputData.timeLeft,
    nextCity: {
      unixarrivalarrival: inputData.nextCity.unixArrivalArrival,
      unixarrival: inputData.nextCity.unixArrival,
      unixdeparture: inputData.nextCity.unixDeparture,
      city: inputData.nextCity.city,
      country: inputData.nextCity.country,
      cc: inputData.nextCity.cc,
      timezone1: inputData.nextCity.timezone,
      basketsdelivered: inputData.nextCity.basketsdelivered, // Change to baskets delivered
      carrots_eaten: inputData.nextCity.carrotsEaten, // Change to carrots eaten
      latitude: inputData.nextCity.latitude,
      longitude: inputData.nextCity.longitude,
      pop_num: inputData.nextCity.popNum, // Change to population number
      pop_year: inputData.nextCity.popYear, // Change to population year
      Elevation_Meter: inputData.nextCity.elevationMeter, // Change to elevation meter
      Arrival_Stoppage_Time: inputData.nextCity.arrivalStoppageTime, // Change to arrival stoppage time
      timezone: inputData.nextCity.timezone,
      Wikipedia_attr: inputData.nextCity.wikipediaAttr,
      wikipedia_link: inputData.nextCity.wikipediaLink
    },
    nextNextCity: {
      unixarrivalarrival: inputData.nextNextCity.unixArrivalArrival,
      unixarrival: inputData.nextNextCity.unixArrival,
      unixdeparture: inputData.nextNextCity.unixDeparture,
      city: inputData.nextNextCity.city,
      country: inputData.nextNextCity.country,
      cc: inputData.nextNextCity.cc,
      timezone1: inputData.nextNextCity.timezone,
      basketsdelivered: inputData.nextNextCity.basketsdelivered, // Change to baskets delivered
      carrots_eaten: inputData.nextNextCity.carrotsEaten, // Change to carrots eaten
      latitude: inputData.nextNextCity.latitude,
      longitude: inputData.nextNextCity.longitude,
      pop_num: inputData.nextNextCity.popNum, // Change to population number
      pop_year: inputData.nextNextCity.popYear, // Change to population year
      Elevation_Meter: inputData.nextNextCity.elevationMeter, // Change to elevation meter
      Arrival_Stoppage_Time: inputData.nextNextCity.arrivalStoppageTime, // Change to arrival stoppage time
      timezone: inputData.nextNextCity.timezone,
      Wikipedia_attr: inputData.nextNextCity.wikipediaAttr,
      wikipedia_link: inputData.nextNextCity.wikipediaLink
    },
    lastCity: {
      unixarrivalarrival: inputData.lastCity.unixArrivalArrival,
      unixarrival: inputData.lastCity.unixArrival,
      unixdeparture: inputData.lastCity.unixDeparture,
      city: inputData.lastCity.city,
      country: inputData.lastCity.country,
      cc: inputData.lastCity.cc,
      timezone1: inputData.lastCity.timezone,
      basketsdelivered: inputData.lastCity.basketsdelivered, // Change to baskets delivered
      carrots_eaten: inputData.lastCity.carrotsEaten, // Change to carrots eaten
      latitude: inputData.lastCity.latitude,
      longitude: inputData.lastCity.longitude,
      pop_num: inputData.lastCity.popNum, // Change to population number
      pop_year: inputData.lastCity.popYear, // Change to population year
      Elevation_Meter: inputData.lastCity.elevationMeter, // Change to elevation meter
      Arrival_Stoppage_Time: inputData.lastCity.arrivalStoppageTime, // Change to arrival stoppage time
      timezone: inputData.lastCity.timezone,
      Wikipedia_attr: inputData.lastCity.wikipediaAttr,
      wikipedia_link: inputData.lastCity.wikipediaLink
    },
    newBasket: {
      unixarrivalarrival: inputData.newBasket.unixArrivalArrival,
      unixarrival: inputData.newBasket.unixArrival,
      unixdeparture: inputData.newBasket.unixDeparture,
      city: inputData.newBasket.city,
      country: inputData.newBasket.country,
      cc: inputData.newBasket.cc,
      timezone1: inputData.newBasket.timezone,
      basketsdelivered: inputData.newBasket.basketsdelivered, // Change to baskets delivered
      carrots_eaten: inputData.newBasket.carrotsEaten, // Change to carrots eaten
      latitude: inputData.newBasket.latitude,
      longitude: inputData.newBasket.longitude,
      pop_num: inputData.newBasket.popNum, // Change to population number
      pop_year: inputData.newBasket.popYear, // Change to population year
      Elevation_Meter: inputData.newBasket.elevationMeter, // Change to elevation meter
      Arrival_Stoppage_Time: inputData.newBasket.arrivalStoppageTime, // Change to arrival stoppage time
      timezone: inputData.newBasket.timezone,
      Wikipedia_attr: inputData.newBasket.wikipediaAttr,
      wikipedia_link: inputData.newBasket.wikipediaLink
    }
  };
}

let debounceTimeout2;
const presetCityUrl = 'https://theelevatedmoments.com/wp-content/uploads/2023/12/A63I8240.jpg'; // Preset fallback image URL

let lastCity44444 = null;

function setCityImage(nextCity2) {
  if (debounceTimeout2 || lastCity44444 === nextCity2) return; // Debounce check with last city

  const imageElement = document.getElementById("flag3");

  if (imageData[nextCity2] && imageData[nextCity2].length > 0) {
    // Randomly select an image from the available images
    const cityImages = imageData[nextCity2];
    const randomImage = cityImages[Math.floor(Math.random() * cityImages.length)];
    imageElement.src = randomImage.url;
    imageElement.setAttribute('alt', `Image for ${nextCity2}`);
    document.getElementById('lastCityInfo3').innerHTML = `© ${randomImage.attribution}`
  } else {
    // Fallback to preset city image if city not found or no images available
    imageElement.src = presetCityUrl;
    imageElement.setAttribute('alt', 'Default city image');
    document.getElementById('lastCityInfo3').innerHTML = "No image available.";
  }

  // Update the last city
  lastCity44444 = nextCity2;

  debounceTimeout2 = setTimeout(() => {
    debounceTimeout2 = null; // Reset debounce after 20 seconds
  }, 20000);
}

var allowrollrequest = false;
// Wrap the logic inside an async function
async function activateWakeLock() {
  if ('wakeLock' in navigator && window.isSecureContext) {
    let wakeLock = null;

    try {
      wakeLock = await navigator.wakeLock.request('display');
      console.log("Display wake lock is active.");
    } catch (err) {
      console.error(`Failed to acquire wake lock: ${err}`);
    }
  } else {
    console.log("Wake Lock API is not supported or not available in this context.");
  }
}

// Call the async function
activateWakeLock();

function handleSSE(event) {
  // Parse the event data

  let data;
  if (typeof event === 'string') {
    try {
      data = JSON.parse(event);
    } catch (error) {
      console.error('Error parsing event data:', error);

      warnuserError("Error", "An unknown error occured.")
      return; // Exit if parsing fails
    }
  } else if (typeof event === 'object') {
    data = event; // Use the object directly
  } else {
    console.error('Unexpected event format:', event);
    warnuserError("Error", "An unknown error occured.")
    return; // Exit if the format is unexpected
  }
  if (startallowed === true) {

    if (parseInt(data.timeLeft, 10) <= parseInt(data.currentCity.Arrival_Stoppage_Time, 10)) {
      //console.log("RUNNING@!")
      isrollingrandomly = true
      let nextNextCityCoords = [data.nextNextCity.latitude, data.nextNextCity.longitude];

      // updaterollrandomly(data.timeLeft, nextNextCityCoords,data.nextCity.city+data.nextCity.country);
    } else {
      isrollingrandomly = false
    }

    //console.log("timeleft: " + data.timeLeft)
    //console.log("arrival time: " + data.currentCity.Arrival_Stoppage_Time)
    if (data.trackerended === true) {
      window.open("/")
    }
    citylocation213 = data.nextCity.city

    // Check if the tracker has ended
    timeLeftValue = data.timeLeft
    if (data.trackerEnded === true) {
      // Call your function to execute when the tracker ends
      //console.log("ENDED")

    }
    if (data.nextCity) {
actualtime = data.nextCity.unixarrivalarrival-(currenttimeunixsec/1000)

      function formatTime(seconds) {
        const years = Math.floor(seconds / (3600 * 24 * 365));
        seconds -= years * 3600 * 24 * 365;

        const days = Math.floor(seconds / (3600 * 24));
        seconds -= days * 3600 * 24;

        const hours = Math.floor(seconds / 3600);
        seconds -= hours * 3600;

        const minutes = Math.floor(seconds / 60);
        seconds -= minutes * 60;

        let timeString = '';
        if (years > 0) {
          timeString += `${years} year${years > 1 ? 's' : ''} `;
        }
        if (days > 0) {
          timeString += `${days} day${days > 1 ? 's' : ''} `;
        }
        if (hours > 0) {
          timeString += `${hours} hour${hours > 1 ? 's' : ''} `;
        }
        if (minutes > 0) {
          timeString += `${minutes} minute${minutes > 1 ? 's' : ''} `;
        }
        if (seconds > 0) {
          timeString += `${seconds} second${seconds > 1 ? 's' : ''}`;
        }

        return timeString.trim();
      }
      if (!nobaskets) {
        if (data.lastCity) {
          addBasket(data.lastCity);
        }
      }
      if (data.lastCity.country === "pt") {
        setInterval(() => {
          const now = new Date(currenttimeunixsec);
          const targetTime = new Date(now); // Initialize with current local time
          targetTime.setUTCHours(9, 0, 0, 0); // Set target time to 4:00 AM CDT (9:00 UTC)

          // Check if current time is after 4 AM CDT
          if (now.getUTCHours() >= 9) {
            // Current time is after 4 AM CDT, use the next day
            targetTime.setUTCDate(now.getUTCDate() + 1);
          }

          // Calculate time remaining until target time
          const timeRemaining = targetTime - now;
          if (timeRemaining < 0) return; // Stop countdown if target time is reached

          // Format the remaining time
          const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeRemaining % (1000 * 60)) / 1000);

          // Display the remaining time
          document.getElementById('launchTimer').textContent = hours.toString().padStart(2, '0') + ":" +
            minutes.toString().padStart(2, '0') + ":" + seconds.toString().padStart(2, '0');
        }, 1000);



        // If timeleft is more than 1 hour, hide the elements
        document.getElementById('hideavailable').hidden = true;
        document.getElementById('launchID').hidden = false;
      } else {
        document.getElementById('hideavailable').hidden = false;
        document.getElementById('launchID').hidden = true;
      }
      function addCommaOrNot(inputString) {
        if (inputString.toLowerCase().includes("pt")) {
          return ""; // No comma if "pt" is found
        } else {
          return ","; // Add comma if "pt" is not found
        }
      }
      document.getElementById('nextCityInfo').textContent = data.nextCity ?
        (data.timeLeft <= parseInt(data.currentCity.Arrival_Stoppage_Time)
          ?
          (`${data.nextCity.city.replace(/^"(.*)"$/, '$1')}, ${data.nextCity.country.replace(/^"(.*)"$/, '$1')} in ${formatTime(data.timeLeft)}.`) :
          (data.nextCity.country.endsWith('"') ?
            (data.nextCity.country.includes('pt') ?
              `${data.nextCity.country.replace(/^"(.*)"$/, '$1')}` :
              `${data.nextCity.city.replace(/^"(.*)"$/, '$1')}, ${data.nextCity.country.replace(/^"(.*)"$/, '$1')} in ${formatTime(data.timeLeft)}.`)
            : `${data.nextCity.city.replace(/^"(.*)"$/, '$1')}, ${data.nextCity.country.replace(/^"(.*)"$/, '$1')} in ${formatTime(data.timeLeft)}.`))
        : "";
      if (data.timeLeft <= parseInt(data.currentCity.Arrival_Stoppage_Time)) {
        iscurrentlydelivering = true
        santaOverlay.billboard.image = "/assets/santaoverlay.png"
        moving = true;
        stopped = true;

      } else {
        iscurrentlydelivering = false
        stopped = true;
        moving = true;
        santaOverlay.billboard.image = "/assets/santaoverlay.png"

      }
      function getifitistrueorfalse(inputString) {
        if (inputString.toLowerCase() === "pt") {
          return false; // No comma if "pt" is found
        } else {
          return true; // Add comma if "pt" is not found
        }

      }

      timeleft2 = data.timeLeft
      document.getElementById('lastCityInfo').textContent = data.lastCity ? `${data.lastCity.city}${addCommaOrNot(data.lastCity.country)} ${removeQuotation(data.lastCity.country)}` : "";
      let nextCity2 = data.nextCity.city
      if (prog1set === false) {

        prog1set = true
      //  console.log(parseInt(data.lastCity.unixarrivalarrival) / parseInt(data.nextCity.unixarrivalarrival))
      }
      setCityImage(nextCity2);
      let image = document.getElementById("flag3")
      const flagImageUrl = getFlagImageUrl(data.nextCity.cc);
      //console.log(flagImageUrl); // Output: https://countryflags.io/US/flat/64.png
      document.getElementById("flag").src = flagImageUrl
      const flagImageUrl2 = getFlagImageUrl(data.lastCity.cc);
      //console.log(flagImageUrl2); // Output: https://countryflags.io/US/flat/64.png
      document.getElementById("flag2").src = flagImageUrl2
      //console.log(getifitistrueorfalse(data.lastCity.country))

      if (getifitistrueorfalse(data.lastCity.country) == false) {
        // If timeleft is more than 1 hour, hide the elements

        document.getElementById('hideavailable').style.display = 'none';
      } else {
        document.getElementById('hideavailable').style.display = 'block';
      }
      function removeQuotation(text) {
        // Check if the text ends with 'pt"'
        if (text.endsWith('pt')) {
          // Remove the last two characters ('pt')
          return text.slice(0, -2);
        } else {
          // Replace any quotation marks with an empty string
          return text.replace(/"/g, '');
        }
      }
     
      
      if (data.lastCity.city !== lastcitystopped) {
        if (data.nextCity.city === "International Space Station") {
          allowedtoheightincrease2 = false
          TweenLite.to({ progress: 13100 }, data.timeLeft, {
            progress: 300100, // From -amplitude to +amplitude
            ease: Power1.easeInOut, // Smooth easing
            onUpdate: function () {
              if (parseInt(this.target.progress) >= 280000 && !alreadyinsertediss) {
                alreadyinsertediss = true
                // Add an entity with a 3D model positioned above the Earth's surface
                ISS = viewer.entities.add({
                  position: Cesium.Cartesian3.fromDegrees(data.nextCity.longitude, data.nextCity.latitude, 300100), // 100 km above the surface
                  id: "iss",
                  model: {
                    uri: '/assets/ISS.glb',
                    scale: 90.1 // Smaller scale
                  },
                  });
              }
              height2 = this.target.progress; // Update the pitch variable
              height3 = this.target.progress + 200;
            },
           
          });
          TweenLite.to({ progress: pitch }, 3, {
            progress: amplitude, // From -amplitude to +amplitude
            ease: Power1.easeInOut, // Smooth easing
            onUpdate: function () {
              pitch = this.target.progress; // Update the pitch variable
            },
            
          });
        } else if (data.lastCity.city === "International Space Station") {
          allowedtoheightincrease2 = false
          TweenLite.to({ progress: 300100}, data.timeLeft, {
            progress: 13100, // From -amplitude to +amplitude
            ease: Power1.easeInOut, // Smooth easing
            onUpdate: function () {
              if (parseInt(this.target.progress) <= 280000 && !alreadyremovediss) {
               alreadyremovediss = true
               viewer.entities.remove(ISS)
              }
              height2 = this.target.progress; // Update the pitch variable
              height3 = this.target.progress + 200;
            },
           
          });
          TweenLite.to({ progress: pitch }, 3, {
            progress: -amplitude, // From -amplitude to +amplitude
            ease: Power1.easeInOut, // Smooth easing
            onUpdate: function () {
              pitch = this.target.progress; // Update the pitch variable
            },
            
          });
        } else {
          if (allowedtoheightincrease2 === false) {
            allowedtoheightincrease2 = true
            Up()
            setTimeout(() => {
              Up2()
              
            }, 2200);
          }
          

        }
        startBasketCounter(data.timeLeft, data.lastCity.basketsdelivered, data.nextCity.basketsdelivered);
        lastcitystopped = data.lastCity.city; // Corrected assignment operator
        //  console.log("timearrive" +data.nextCity.unixarrivalarrival)
        setTimeout(() => {
          allowrollrequest = true
        }, ((parseInt(data.timeLeft)/3)*2));
        
        flyToSanta(data.nextCity.latitude, data.nextCity.longitude, data.timeLeft, data.nextCity.city, data.lastCity.longitude, data.lastCity.latitude, NaN, NaN, data.lastCity.unixarrivalarrival, data.nextCity.unixarrivalarrival); // Move Santa to New York City in 5 seconds
      } else {

      }

    }
  }
}
// Example cityInfo object
const cityInfo = {
  longitude: -75.59777,
  latitude: 40.03883
};



// Add the billboard entity for the overlay
const santaOverlay = viewer.entities.add({
  position: Cesium.Cartesian3.fromDegrees(cityInfo.longitude, cityInfo.latitude),
  billboard: {
    image: '/assets/santaoverlay.png',
    width: 50,
    height: 50,
    show: false, // Initially hidden

  },
  EyeOffset: new Cesium.Cartesian3(0, 0, 15000), // Bring to front
  id: "santaoverlaythingy"
});

santaOverlay.allowPicking = false;
viewer.camera.changed.addEventListener(() => {
  const zoomLevel = viewer.camera.getMagnitude();
  if (zoomLevel > 200000) { // Adjust the threshold as needed
    santaOverlay.billboard.show = true;
    santa2.model.show = false;
  } else {
    santaOverlay.billboard.show = false;
    santa2.model.show = true;
  }
});


// Assuming 'viewer' is your Cesium Viewer instance
// and 'entity' is the entity you want to fly to
function startview() {
  setTimeout(() => {
    // Ensure the 'santa' entity has a valid position
    if (santa && santa.position) {
      const position = santa.position.getValue(Cesium.JulianDate.fromDate(new Date(currenttimeunixsec)));

      // Check if the position is valid
      if (position) {
        viewer.camera.flyTo({
          destination: position,
          duration: 3 // Duration of the fly to animation in seconds
        });
        setTimeout(() => {
          allowedtotrackedentity = true
          viewer.trackedEntity = santa;
          // Function to get the value of a specific query parameter by name
          function getQueryParam(param) {
            const currentUrl = new URL(window.location.href);
            return currentUrl.searchParams.get(param);
          }

          // Set the minimum zoom distance based on the `eyeoffset` query parameter
          const eyeOffsetParam = getQueryParam('eyeoffset'); // Get the value of 'eyeoffset'
          const eyeOffsetValue = eyeOffsetParam ? parseFloat(eyeOffsetParam) * 1000 : 15000; // Multiply by 1000 or default to 1200

          viewer.scene.screenSpaceCameraController.minimumZoomDistance = eyeOffsetValue; // Set the minimum zoom distance

          // Set the minimum zoom distance to 30 after 5 seconds
          setTimeout(() => {
            viewer.scene.screenSpaceCameraController.minimumZoomDistance = 100; // Adjusted minimum zoom distance
          }, 3000); // 5000 milliseconds = 5 seconds
        }, 3050);
      } else {
        console.error('Santa position is not valid.');
      }
    } else {
      console.error('Santa entity or position is not defined.');
    }
  }, 2500); // 2 seconds delay

};

// Function to set the tile layer to Bing Maps Aerial with Labels

// Bing Aerial with Labels URL
// const tileLayerUrl = 'https://dev.virtualearth.net/REST/v1/Imagery/Map/AerialWithLabels/{y}/{x}/{z}?mapSize=256,256&key=Ajp5EmHUiLfChanekLlwaiT8pCRVwAx9vIacAkCPdbt8dVcJ1qaOGvbbpMMCPbK9';
//  const tileLayerUrl = "https://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"

// Add a tile layer from an XYZ tile service
// Function to set the tile layer to Bing Maps Aerial with Labels
// Function to set the tile layer to Google Satellite
// Function to set the Bing Maps Aerial with Labels layer
// Function to set the Google Hybrid layer
// Function to set the Stamen Toner hybrid layer
// Function to set the Bing Maps Hybrid layer
// Function to set the Bing Maps Hybrid layer
// Function to set the OpenStreetMap layer
// Function to set the Google Maps Hybrid layer

// Function to set the NASA GIBS VIIRS City Lights 2012 layer
// Function to set Bing Maps Aerial with Labels layer
var bing = new Cesium.BingMapsImageryProvider({
  url: 'https://dev.virtualearth.net',
  key: 'Ajp5EmHUiLfChanekLlwaiT8pCRVwAx9vIacAkCPdbt8dVcJ1qaOGvbbpMMCPbK9', // Your Bing Maps API key
  mapStyle: Cesium.BingMapsStyle.AERIAL_WITH_LABELS // Use Aerial with Labels
});

// Function to set the Bing Maps Aerial with Labels layer
function setBingMapsAerialWithLabels() {


  // Clear existing layers
  // viewer.imageryLayers.removeAll();
  //viewer.imageryLayers.removeAll();

  // Add the Bing Maps imagery provider to the viewer
  // viewer.imageryLayers.addImageryProvider(bing);
}
const particleSystem = scene.primitives.add(
  new Cesium.ParticleSystem({
    image: "https://cdn-icons-png.flaticon.com/512/589/589907.png",

    startColor: Cesium.Color.LIGHTSEAGREEN.withAlpha(0.7),
    endColor: Cesium.Color.WHITE.withAlpha(0.0),

    startScale: santa2.startScale,
    endScale: santa2.endScale,

    minimumParticleLife: santa2.minimumParticleLife,
    maximumParticleLife: santa2.maximumParticleLife,

    minimumSpeed: santa2.minimumSpeed,
    maximumSpeed: santa2.maximumSpeed,

    imageSize: new Cesium.Cartesian2(
      santa2.particleSize,
      santa2.particleSize,
    ),

    emissionRate: viewModel.emissionRate,

    bursts: [
      // these burst will occasionally sync to create a multicolored effect
      new Cesium.ParticleBurst({
        time: 5.0,
        minimum: 10,
        maximum: 100,
      }),
      new Cesium.ParticleBurst({
        time: 10.0,
        minimum: 50,
        maximum: 100,
      }),
      new Cesium.ParticleBurst({
        time: 15.0,
        minimum: 200,
        maximum: 300,
      }),
    ],

    lifetime: 16.0,

    emitter: new Cesium.CircleEmitter(2.0),

    emitterModelMatrix: computeEmitterModelMatrix(),

    updateCallback: applyGravity,
  }),
);

const gravityScratch = new Cesium.Cartesian3();

function applyGravity(p, dt) {
  // We need to compute a local up vector for each particle in geocentric space.
  const position = p.position;

  Cesium.Cartesian3.normalize(position, gravityScratch);
  Cesium.Cartesian3.multiplyByScalar(
    gravityScratch,
    santa2.gravity * dt,
    gravityScratch,
  );

  p.velocity = Cesium.Cartesian3.add(p.velocity, gravityScratch, p.velocity);
}

// Set up the layer on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function () {
  setBingMapsAerialWithLabels();
});

// Set the custom skybox to the scene
viewer.scene.skyBox = skyBox;


// Optionally, remove the atmosphere for a clearer view of the skybox


// Start listening for SSE messages
/*const eventSource = new EventSource("/updates");
eventSource.onmessage = handleSSE;
source = eventSource

*/
// Error handling setup
Cesium.Ion.onError = handleCesiumIonError;
