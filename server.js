const express = require("express");
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const fs = require("fs");
let cities2 = []
const fspromises = require('fs').promises;
const cors = require('cors'); // Import the CORS package
const UglifyJS = require('uglify-js');
const path = require("path");
const axios = require('axios');
const archiver = require("archiver");
const ejs = require("ejs");
const tsv = require('tsv'); // Make sure you have installed this package
var unixTime = Math.floor(Date.now() / 1000); // Get current Unix time in seconds
const session = require("express-session");
const fetch = require("node-fetch");
const requestIp = require('request-ip');
const geoip = require('geoip-lite');
const nodemailer = require('nodemailer');
const app = express();
app.use(express.json());
setInterval(() => {
  unixTime = Math.floor(Date.now() / 1000);
}, 1000);
const webpush = require('web-push');
// Your existing VAPID key setup and subscription array
const vapidKeys = {
  publicKey: 'BP5iKgtWNK0exu3dozTLKpXWZqvr57umuBOeF3uCiTI-tcNusOP_ANk9_gkTeEWW0UCs7D7pP0EO3Ze4k3cwbOs',
  privateKey: 'IY38JG4GQpkP2aA28S8nWwYroDdOC_pknndezLNzs6s',
};
webpush.setVapidDetails('mailto:haydenl@master-trackers.xyz', vapidKeys.publicKey, vapidKeys.privateKey);

const subscriptions = [];

// Subscription endpoint
app.post('/subscribe', (req, res) => {
  const subscription = req.body; // Get subscription from request body

  // Check if required keys are present
  if (!subscription.endpoint || !subscription.keys || !subscription.keys.auth || !subscription.keys.p256dh) {
      return res.status(400).json({ error: 'Invalid subscription' });
  }

  console.log('Received subscription:', subscription); // Log the received subscription
  subscriptions.push(subscription);
  console.log('Current subscriptions:', subscriptions); // Log current subscriptions
  res.status(201).json({}); // Respond with 201 Created status
});


// Your existing notification sending logic
app.get('/send-notification', (req, res) => {
  const { title = 'New Notification!', body = 'You have a new message!' } = req.query;

  const notificationPayload = {
      title: title,
      body: body,
      icon: '/assets/santa.png', // Fixed icon
  };
  

  const promises = subscriptions
      .filter(subscription => subscription.endpoint && subscription.keys && subscription.keys.auth && subscription.keys.p256dh) // Ensure all keys exist
      .map(subscription =>
          webpush.sendNotification(subscription, JSON.stringify(notificationPayload))
              .catch(err => {
                  console.error('Error sending notification, removing subscription:', err);
                  // Remove invalid subscription
                  subscriptions = subscriptions.filter(sub => sub.endpoint !== subscription.endpoint);
              })
      );

  Promise.all(promises)
      .then(() => {
          console.log("Notification sent!", notificationPayload);
          res.status(200).send('Notification sent successfully');
      })
      .catch(err => {
          console.error('Error sending notifications:', err);
          res.status(500).send('Error sending notifications');
      });
});
app.get('/ipinfo', (req, res) => {
  // Extract the client's IP
  const clientIp = requestIp.getClientIp(req) || '0.0.0.0';

  // Get GeoIP data
  const geo = geoip.lookup(clientIp);

  // Default response if GeoIP data is unavailable
  if (!geo) {
      return res.json({
          ip: clientIp,
          network: null,
          version: "Unknown",
          city: null,
          region: null,
          region_code: null,
          country: null,
          country_name: null,
          country_code: null,
          country_code_iso3: null,
          country_capital: null,
          country_tld: null,
          continent_code: null,
          in_eu: false,
          postal: null,
          latitude: null,
          longitude: null,
          timezone: null,
          utc_offset: null,
          country_calling_code: null,
          currency: null,
          currency_name: null,
          languages: null,
          country_area: null,
          country_population: null,
          asn: null,
          org: null,
      });
  }

  // Populate the response with GeoIP data
  const response = {
      ip: clientIp,
      network: geo.range ? `${geo.range[0]}-${geo.range[1]}` : null,
      version: geo.type || "IPv4",
      city: geo.city || null,
      region: geo.region || null,
      region_code: null, // GeoIP-Lite doesn't provide region codes directly
      country: geo.country || null,
      country_name: null, // Requires additional lookup
      country_code: geo.country || null,
      country_code_iso3: null, // Requires additional lookup
      country_capital: null, // Requires additional lookup
      country_tld: null, // Requires additional lookup
      continent_code: null, // Requires additional lookup
      in_eu: false, // Approximation, requires additional lookup
      postal: null, // GeoIP-Lite doesn't provide postal codes
      latitude: geo.ll ? geo.ll[0] : null,
      longitude: geo.ll ? geo.ll[1] : null,
      timezone: null, // Requires additional lookup
      utc_offset: null, // Requires additional lookup
      country_calling_code: null, // Requires additional lookup
      currency: null, // Requires additional lookup
      currency_name: null, // Requires additional lookup
      languages: null, // Requires additional lookup
      country_area: null, // Requires additional lookup
      country_population: null, // Requires additional lookup
      asn: null, // Requires additional lookup or another library
      org: null, // Requires additional lookup or another library
  };

  res.json(response);
});
const DATA_FILE = 'naughtyornicelist.json';
// Helper function to get data from the JSON file
function readData() {
  if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }
  return {};
}

// Helper function to write data to the JSON file
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Endpoint to get naughty or nice status
app.post('/check-status', (req, res) => {
  const name = req.body.name.toLowerCase();
  const data = readData();

  if (data[name]) {
      // User already exists
      res.json({ status: data[name] });
  } else {
      // New user
      const isNice = Math.random() < 0.65; // 95% chance to be nice
      data[name] = isNice ? 'nice' : 'naughty';
      writeData(data);
      res.json({ status: data[name] });
  }
});
// Load the giftsdelivered.json file
const giftsDeliveredPath = path.join(__dirname, 'giftsdelivered.json');

app.get('/getweatherfromcity', (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.status(400).json({ error: 'City parameter is required' });
  }

  // Read the giftsdelivered.json file
  fs.readFile(giftsDeliveredPath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading data file' });
    }

    // Parse the JSON data
    const cities = JSON.parse(data);

    // Find the city in the data
    const cityData = cities.find(cityItem => cityItem.city.toLowerCase() === city.toLowerCase());

    if (cityData) {
      // Return the weather data for the found city
      res.json({
        city: cityData.city,
        country: cityData.country,
        weather: cityData.weather
      });
    } else {
      // City not found in the data
      res.status(404).json({ error: 'City not found' });
    }
  });
});
// Load SSL certificate and key files
/*const options = {
  key: fs.readFileSync('master-trackersxyz.key'),
  cert: fs.readFileSync('/path/to/your/certificate.crt'),
  ca: fs.readFileSync('/path/to/your/ca_bundle.crt') // optional, if your certificate requires a CA bundle
};*/
const jsonFileName = 'giftsdelivered.json';
const openWeatherApiKey = '50d5538d83dc42000fe66441301f65a0';
const blockedIPFile = path.join(__dirname, 'securitypolicies', 'blockedipaddresses.json');
const blockedCountryFile = path.join(__dirname, 'securitypolicies', 'blockedcountries.json');
const blockedHTML = path.join(__dirname, 'securitypolicies', 'youareblocked.html');
// Middleware to load blocked IPs and countries
function loadBlockedLists() {
  let blockedIPs = [];
  let blockedCountries = [];

  try {
    blockedIPs = JSON.parse(fs.readFileSync('securitypolicies/blockedipaddresses.json', 'utf8')) || [];
    blockedCountries = JSON.parse(fs.readFileSync('securitypolicies/blockedcountries.json', 'utf8')) || [];
  } catch (err) {
    console.error('Error loading blocked lists:', err);
  }

  return { blockedIPs, blockedCountries };
}

// Define the /api/ip/get endpoint
app.get('/api/ip/get', (req, res) => {
  // Get the IP address from the request
  const userIP = req.ip;
  const geo = geoip.lookup(userIP);
  // Look up the IP address using geoip-lite

  // Respond with the IP address and geographical info
  res.json({ 
    userIP: userIP,
    geo: geo
  });
});
app.get('/fillbaskets', async (req, res) => {
  try {
    // Read cities from the TSV file
    await readCitiesFromFile2("route2025final.tsv");

    // Ensure deliveredGifts is cleared before adding new data
    deliveredGifts = [];

    // Add all cities to deliveredGifts
    for (let i = 1; i < cities2.length; i++) {
      addToGiftsDelivered(cities2[i]);
    }

    console.log(cities2);

    // Respond with success
    res.json({ success: true, deliveredGifts });
  } catch (error) {
    console.error("Error in /fillbaskets:", error);

    // Respond with error
    res.status(500).json({ success: false, error: error.message });
  }
});

// Define the /time endpoint
app.get('/time', (req, res) => {
  res.json({ unixTime }); // Respond with the Unix time in JSON format
});
// Middleware to check if the IP or country is blocked
function checkBlocked(req, res, next) {
  // Skip the blockage check for specific paths
  if (req.path === '/assets/termsofblockage.html') {
    return next();
  } else {
    res.sendFile(path.join(__dirname, "src", "assets", "termsofblockage.html"));
return next()
  }

  const { blockedIPs, blockedCountries } = loadBlockedLists();
  const userIP = req.ip;
  const geo = geoip.lookup(userIP);

  // Log the IP address and country being checked
  const country = geo ? geo.country : "Unknown Country";
  console.log(`Checking IP: ${userIP} from ${country}`);

  // Check if the IP or country is blocked and log the reason
  if (blockedIPs.includes(userIP)) {
    console.log(`Blocked IP: ${userIP}`);
    return res.sendFile(blockedHTML);
  } else if (geo && blockedCountries.includes(geo.country)) {
    console.log(`Blocked Country: ${geo.country} (IP: ${userIP})`);
    return res.sendFile(blockedHTML);
  }

  
}



// Apply the block-checking middleware to all routes
// app.use(checkBlocked);

// Get the list of blocked IP addresses
app.get('/blocked/ips', (req, res) => {
  const { blockedIPs } = loadBlockedLists();
  res.json(blockedIPs);
});

// Get the list of blocked countries
app.get('/blocked/countries', (req, res) => {
  const { blockedCountries } = loadBlockedLists();
  res.json(blockedCountries);
});

// Add a blocked IP address
app.post('/blocked/ips/add', express.json(), (req, res) => {
  const { ip } = req.body;
  const { blockedIPs } = loadBlockedLists();

  if (!blockedIPs.includes(ip)) {
    blockedIPs.push(ip);
    fs.writeFileSync(blockedIPFile, JSON.stringify(blockedIPs, null, 2));
  }

  res.json({ success: true, blockedIPs });
});

// Remove a blocked IP address
app.post('/blocked/ips/remove', express.json(), (req, res) => {
  const { ip } = req.body;
  let { blockedIPs } = loadBlockedLists();

  blockedIPs = blockedIPs.filter(item => item !== ip);
  fs.writeFileSync(blockedIPFile, JSON.stringify(blockedIPs, null, 2));

  res.json({ success: true, blockedIPs });
});

// Add a blocked country
app.post('/blocked/countries/add', express.json(), (req, res) => {
  const { country } = req.body;
  const { blockedCountries } = loadBlockedLists();

  if (!blockedCountries.includes(country)) {
    blockedCountries.push(country);
    fs.writeFileSync(blockedCountryFile, JSON.stringify(blockedCountries, null, 2));
  }

  res.json({ success: true, blockedCountries });
});

// Remove a blocked country
app.post('/blocked/countries/remove', express.json(), (req, res) => {
  const { country } = req.body;
  let { blockedCountries } = loadBlockedLists();

  blockedCountries = blockedCountries.filter(item => item !== country);
  fs.writeFileSync(blockedCountryFile, JSON.stringify(blockedCountries, null, 2));

  res.json({ success: true, blockedCountries });
});

let previousNextCity = null;
var iszoomedalready = false
// Example usage:
var zoomamount
var moving = true;
var lastcordlatlng
// Assuming you have debounce function defined elsewhere
// Example debounce function
let newLatLng = { lat: 0, lng: 0 }; // Default initial value

let nextLatLng;
var lastUpdateTime = Date.now()
    // Global variables to store tweening parameters
    // Global variables to store tweening parameters
    let tweeningInterval;
    let tweeningSteps = 10000; // Adjust the number of steps for smoother animation
    let GIFTSDELIVERED = 0;
    let debounce = false; // Flag to ensure initialization runs only once
/* function handleSSE(event) {
  if (started === true) {
  

  // Parse the event data
  const data = JSON.parse(event);
 
  if (data === undefined || data === null) {
    console.error('Received data is undefined or null:', data);
    return;
  }
  if (data.timeLeft <= parseInt(data.currentCity.Arrival_Stoppage_Time)) {
    iscurrentlydelivering = true
    moving = false;
    stopped = false;
    
    
  } else {
    iscurrentlydelivering = false
    stopped = true;
    moving = true;
    
   
    }



// console.log(newLatLng)

 if (data.currentCity && data.nextCity && data.lastCity) {
  // Define nextLatLng with correct property names
  const nextLatLng = {
    lat: data.nextCity.latitude,
    lng: data.nextCity.longitude
  };


  // Example of updating logic
  if (!debounce) {
    currentLatLng = { lat: 0, lng: 0 }; // Initialize to default
    debounce = true; // Prevent re-initialization
  } else {
    // Continue from the previous location
    currentLatLng = { lat: currentLatLng.lat, lng: currentLatLng.lng };
  }

 // console.log('Current LatLng:', currentLatLng);

  // Calculate the differences in latitude and longitude
  const latDiff = nextLatLng.lat - currentLatLng.lat;
  const lngDiff = nextLatLng.lng - currentLatLng.lng;
  const originalDistance = Math.sqrt(latDiff ** 2 + lngDiff ** 2);
  const distance = originalDistance * 1; // Doubling the original distance

  const tweeningDuration = data.timeLeft * 1000 - data.nextCity.Arrival_Stoppage_Time; // Convert time left to milliseconds

  const steps = tweeningSteps; // Total number of steps

  const latStep = latDiff / steps;
  const lngStep = lngDiff / steps;

  let stepCount = 0;
  const currentNextCity = data.nextCity;

  // Clear any existing tweening interval
  clearInterval(tweeningInterval);

  // Start tweening interval
  tweeningInterval = setInterval(() => {
    const SPEED = Math.sqrt(latStep ** 2 + lngStep ** 2) * (1000000 / (tweeningDuration / steps))/2;
    if (stepCount >= steps) {
      clearInterval(tweeningInterval);
    } else {
      if (moving === true) {
        const newLat = currentLatLng.lat + latStep * stepCount;
        const newLng = currentLatLng.lng + lngStep * stepCount;
        currentLatLng = {
          lat: newLat,
          lng: newLng
        };
        lastcordlatlng = currentLatLng
        //console.log(currentLatLng);
        stepCount++;

        // Update tween speed text (if needed)
      }
    }
  }, tweeningDuration / steps); // Adjust timing based on calculated duration
}}}
*/

let isUpdating = false;
// Serve static files (adjust the path as per your project structure)



// Function to get weather data for a location
const getWeatherData = async (lat, lon) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherApiKey}&units=metric`;
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching weather data: ${error}`);
    return null;
  }
};

// Function to update the JSON file with weather data
const updateJsonFileWithWeather = async () => {
  if (isUpdating) return; // Prevent multiple simultaneous updates

  isUpdating = true;
  fs.readFile(jsonFileName, 'utf8', async (err, data) => {
    if (err) {
      console.error(`Error reading file: ${err}`);
      isUpdating = false;
      return;
    }

    try {
      const jsonArray = JSON.parse(data);
      for (const item of jsonArray) {
        if (!item.weather) {
          const weatherData = await getWeatherData(item.latitude, item.longitude);
          if (weatherData) {
            item.weather = {
              temperature: weatherData.main.temp,
              description: weatherData.weather[0].description,
              humidity: weatherData.main.humidity,
            };
          }
        }
      }

      fs.writeFile(jsonFileName, JSON.stringify(jsonArray, null, 2), 'utf8', err => {
        if (err) {
          console.error(`Error writing file: ${err}`);
        } else {
          //     console.log('File updated with weather data.');
        }
        isUpdating = false;
      });
    } catch (parseError) {
      console.error(`Error parsing JSON: ${parseError}`);
      isUpdating = false;
    }
  });
};

// Watch the JSON file for changes
fs.watch(jsonFileName, (eventType, filename) => {
  if (filename && path.extname(filename) === '.json') {
    // console.log(`${filename} has been modified.`);
    updateJsonFileWithWeather();
  }
});
var peopleonthesite = 0;
app.locals.clients = []; // Initialize clients array
async function sendMessageToWebhook(message) {
  if (!message.includes("Santa Claus just left **Santa's Village, pt**")) {
  const webhookUrl =
  "https://discord.com/api/webhooks/1262791772233404446/i4WdpVX_foWs8dre_C7gQxpGEsCH6JKP9rND_hXEmwUP4yQzagrPPhZOcUn9Sx9Ob4_i";

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: "<@&1213936947156881448> " + message, message,
      }),
    });

    if (!response.ok) {
      console.error(
        `Failed to send message to webhook: ${response.statusText}`
      );
      return;
    }

    // console.log("Message sent successfully!");
  } catch (error) {
    console.error("Error sending message to webhook:", error);
  }
}}

const EMAILS_FILE = path.join(__dirname, 'emailsregistered.json');
// Initialize nodemailer transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: 'tracker@master-trackers.xyz',
    pass: '9MWX3Q5GUE04' // Replace with your Zoho app password
  },
  tls: {
    rejectUnauthorized: false // Ignore self-signed certificate errors
  }
});

app.use((req, res, next) => {
  const host = req.hostname;

  // Check if the hostname is localhost or an IP address
  const isLocalhostOrIP = host === 'localhost' || /^[\d.]+$/.test(host);

  // List of subdomains to exclude from redirection
  const excludedSubdomains = ['temp', 'developer', 'santa', 'status', 'api'];

  // Extract subdomain
  const subdomain = host.split('.')[0];

  // Skip redirect if it's localhost or an IP address
  if (isLocalhostOrIP) {
    return next();
  }

  // Redirect if the subdomain is not excluded
  if (!excludedSubdomains.includes(subdomain)) {
    res.redirect(301, 'https://santa.master-trackers.xyz' + req.originalUrl);
  } else if (host === 'developer.master-trackers.xyz') {
    return res.sendFile(path.join(__dirname, "developerport.html"));
  } else {
    next(); // If no redirect is needed, proceed to the next middleware/route
  }
});

app.use(cors());

// Function to send email with HTML content
async function sendEmailToUser(email, htmlContent) {
  try {
    /*await transporter.sendMail({
      from: 'tracker@master-trackers.xyz',
      to: email,
      subject: 'Welcome to our mailing list!',
      html: htmlContent + `<br/><a href="http://master-trackers.xyz/unsubscribe?email=${email}" target="_blank">Unsubscribe</button>
      </div>`
    });*/

    // console.log(`Email sent successfully to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
const yearlyVisitsFile = path.resolve(__dirname, 'yearlyvisits.json');

// Middleware to get the client IP
app.use(requestIp.mw());

// Endpoint to log the number provided in the URL with an optional country query parameter
app.get('/hit/:number', (req, res) => {
  const number = parseInt(req.params.number);
  const clientIp = req.clientIp;
  const providedCountry = req.query.country; // Get the country from query parameters

  // Log the IP address and provided country for debugging
  console.log(`Client IP: ${clientIp}`);
  console.log(`Provided country: ${providedCountry}`);

  let country;

  // Use provided country if available, otherwise fallback to geoip lookup
  if (providedCountry) {
    country = providedCountry;
  } else if (clientIp === '::1' || clientIp === '127.0.0.1') {
    country = 'Localhost';
  } else {
    const geo = geoip.lookup(clientIp);
    country = geo ? geo.country : 'Unknown';
  }

  console.log(`Received number: ${number} from country: ${country}`);

  // Log the hit with country information to a file
  fs.appendFile('country_hits.log', `Number: ${number}, Country: ${country}\n`, (err) => {
    if (err) throw err;
  });

  res.json({ message: `Received number: ${number} from country: ${country}` });
  addHit(number, country);
});

// Function to add hits to the specified type
function addHit(type, country) {
  // Read the JSON file
  fs.readFile(yearlyVisitsFile, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }

    let yearlyVisits = JSON.parse(data);

    // Find the entry for the current year or create one if it doesn't exist
    let currentYearEntry = yearlyVisits.find(entry => entry.year === new Date().getFullYear());
    if (!currentYearEntry) {
      currentYearEntry = {
        year: new Date().getFullYear(),
        hitsduringtracking: 0,
        hitsduringpretracking: 0,
        hitsbeforepretrackingaftermonthstart: 0,
        hitsbeforemonthstart: 0,
        countries: {}
      };
      yearlyVisits.push(currentYearEntry);
    } else if (!currentYearEntry.countries) {
      // Ensure countries property is initialized if it doesn't exist
      currentYearEntry.countries = {};
    }

    // Increment the hits for the specified type
    switch (type) {
      case 1:
        currentYearEntry.hitsduringtracking++;
        break;
      case 2:
        currentYearEntry.hitsduringpretracking++;
        break;
      case 3:
        currentYearEntry.hitsbeforepretrackingaftermonthstart++;
        break;
      case 4:
        currentYearEntry.hitsbeforemonthstart++;
        break;
      default:
        console.log('Invalid type specified.');
        return;
    }

    // Increment the hits for the specified country
    if (currentYearEntry.countries[country]) {
      currentYearEntry.countries[country]++;
    } else {
      currentYearEntry.countries[country] = 1;
    }

    // Write the updated data back to the file
    fs.writeFile(yearlyVisitsFile, JSON.stringify(yearlyVisits, null, 2), 'utf8', (err) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(`Added 1 hit to type ${type} from country ${country}.`);
    });
  });
}

app.get('/addemailtomailinglist', async (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Read existing emails from the file
    const fileData = await fspromises.readFile(EMAILS_FILE, 'utf-8');
    const existingEmails = JSON.parse(fileData);

    // Ensure existingEmails is an array
    if (!Array.isArray(existingEmails)) {
      throw new Error('Existing emails data is not in array format');
    }

    // Check if the email already exists
    if (!existingEmails.includes(email)) {
      // Add the new email to the list
      existingEmails.push(email);

      // Write the updated list back to the file
      await fspromises.writeFile(EMAILS_FILE, JSON.stringify(existingEmails, null, 2));
      var htmlcontent1 = "<div style=\"font-family: Arial, sans-serif; text-align: center;\"><h2>Thank you for registering for updates!</h2><p>You'll now receive the latest updates straight to your inbox.</p><img src=\"https://t3.ftcdn.net/jpg/05/76/15/06/360_F_576150680_LC9TW0BEpqnhHkhwCPPXsxxFfVS8cRAS.jpg\" alt=\"Confirmation Image\" style=\"max-width: 100%; height: auto;\"></div>"

      // Send registration email
      await sendEmailToUser(email, htmlcontent1);

      return res.json({ message: 'Email added to the mailing list successfully' });
    }

    // If the email already exists in the list
    return res.status(400).json({ error: 'Email already exists in the mailing list' });
  } catch (error) {
    console.error('Error adding email to mailing list:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
var readytoshowendedscreen = false;
app.get('/unsubscribe', async (req, res) => {
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    // Read existing emails from the file
    let existingEmails = await fspromises.readFile(EMAILS_FILE, 'utf-8');
    existingEmails = JSON.parse(existingEmails);

    // Ensure existingEmails is an array
    if (!Array.isArray(existingEmails)) {
      throw new Error('Existing emails data is not in array format');
    }

    // Check if the email exists in the list
    const emailIndex = existingEmails.indexOf(email);
    if (emailIndex !== -1) {
      // Remove the email from the list
      existingEmails.splice(emailIndex, 1);

      // Write the updated list back to the file
      await fspromises.writeFile(EMAILS_FILE, JSON.stringify(existingEmails, null, 2));

      // Return success message
      return res.send('<h2>You have been successfully unsubscribed from our mailing list.</h2>');
    }

    // If the email doesn't exist in the list
    return res.status(404).json({ error: 'Email not found in the mailing list' });
  } catch (error) {
    console.error('Error unsubscribing email:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
// Define a route to serve the news page
// Define a route to serve the news page
app.get('/news', (req, res) => {
  // Construct the file path to the news.html file
  const filePath = path.join(__dirname, 'src', 'pages', 'news.html');

  // Get the value of the scroll parameter from the query string
  const scrollParam = req.query.scroll;

  // If the scroll parameter is present, append it to the URL
  const finalUrl = scrollParam ? `${filePath}?scroll=${scrollParam}` : filePath;

  // Send the HTML file with the updated URL to the client
  res.sendFile(finalUrl);
});

async function sendMessageToWebhook2(message) {
  const webhookUrl =
    "";

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: "<@&1213936810015588372> " + message,
      }),
    });

    if (!response.ok) {
      console.error(
        `Failed to send message to webhook: ${response.statusText}`
      );
      return;
    }

    //  console.log("Message sent successfully!");
  } catch (error) {
    console.error("Error sending message to webhook:", error);
  }
}
app.get('/current', (req, res) => {
  if (!started) {
    return res.json({
      currentCity: NaN,
      nextCity: NaN,
      basketCount: NaN
    });
  }

  const currentCity = app.get("currentCity") || {};
  const nextCity = cities[currentIndex] || {};
  const basketCount = calculateBasketsDelivered(currentCity, timeLeft);

  res.json({
    currentCity: {
      city: currentCity.city || NaN,
      country: currentCity.country || NaN,
      latitude: currentCity.latitude || NaN,
      longitude: currentCity.longitude || NaN,
      basketsdelivered: currentCity.basketsdelivered || NaN,
      carrots_eaten: currentCity.carrots_eaten || NaN,
      pop_num: currentCity.pop_num || NaN,
      pop_year: currentCity.pop_year || NaN,
      Elevation_Meter: currentCity.Elevation_Meter || NaN,
      Arrival_Stoppage_Time: currentCity.Arrival_Stoppage_Time || NaN,
      Timezone: currentCity.Timezone || NaN,
      Wikipedia_attr: currentCity.Wikipedia_attr || NaN,
      wikipedia_link: currentCity.wikipedia_link || NaN
    },
    nextCity: {
      city: nextCity.city || NaN,
      country: nextCity.country || NaN,
      latitude: nextCity.latitude || NaN,
      longitude: nextCity.longitude || NaN,
      basketsdelivered: nextCity.basketsdelivered || NaN,
      carrots_eaten: nextCity.carrots_eaten || NaN,
      pop_num: nextCity.pop_num || NaN,
      pop_year: nextCity.pop_year || NaN,
      Elevation_Meter: nextCity.Elevation_Meter || NaN,
      Arrival_Stoppage_Time: nextCity.Arrival_Stoppage_Time || NaN,
      Timezone: nextCity.Timezone || NaN,
      Wikipedia_attr: nextCity.Wikipedia_attr || NaN,
      wikipedia_link: nextCity.wikipedia_link || NaN
    },
    basketCount: basketCount || NaN
  });
});

let lastcountries = "Bunny went to the places of: ";
let cities = [];
let currentIndex;
let isTrackerStarted = false;
let maxpresents = 8092411974;
let lastCity;
let startTime;
let started = false;
let trackerInterval;
const countdownDate = new Date("2024-12-25T08:00:00Z");
// Define the time intervals for each task in milliseconds (in CDT)
const taskIntervals = {
  "/restarttracker": convertToCDT("4/1/2024 11:05:00"), // 1:27:00 PM
  "/resetbaskets": convertToCDT("4/1/2024 11:05:00"), // 1:27:00 PM
  "/unlock": convertToCDT("4/1/2024 11:05:00"), // 1:27:00 PM
  "/message1set": convertToCDT("4/1/2024 11:10:00"), // 1:27:00 PM
  "/message2set": convertToCDT("5/25/2025 13:27:00"), // 1:27:00 PM
  "/message3set": convertToCDT("5/25/2025 13:27:00"), // 1:27:00 PM
  "/message4set": convertToCDT("5/25/2025 13:27:00"), // 1:27:00 PM
  "/starttracker": convertToCDT("4/1/2024 11:05:00"), // 1:27:00 PM
};
// Function to convert input date to CDT
function convertToCDT(inputDate) {
  // Parse input date string
  const [date, time] = inputDate.split(' ');
  const [month, day, year] = date.split('/');
  const [hour, minute, second] = time.split(':');

  // Create date object in UTC
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));

  // Convert UTC date to CDT
  const cdtOffset = -5 * 60; // Offset for CDT in minutes
  const cdtDate = new Date(utcDate.getTime() - cdtOffset * 60000);

  // Return the timestamp in milliseconds
  return cdtDate.getTime();
}
// Endpoint to set the countdown date
app.post("/setcountdowndate", (req, res) => {
  // Assuming the client sends the countdown date in the request body
  const { date } = req.body;

  // Validate the date format (you may need to adjust this based on your requirements)
  if (isValidDate(date)) {
    countdownDate = new Date(date);
    res.send("Countdown date set successfully.");
  } else {
    res.status(400).send("Invalid date format. Please provide a valid date.");
  }
});
// Endpoint to return the value of peopleonthesite in JSON format
app.get('/peopleonthesite', (req, res) => {
  res.json({ peopleonthesite: peopleonthesite });
});
app.get("/visitsite", (req, res) => {
  peopleonthesite = peopleonthesite + 1;
});
// Endpoint to send a message to live chat via SSE
app.get('/chatsend', (req, res) => {
  const { message } = req.query;

  if (!message) {
    return res.status(400).send('Message parameter is required');
  }

  // Send the message to all connected clients
  sendSSEUpdate({ message });

  res.status(200).send('Message sent to live chat');
});
// Endpoint to establish SSE connection for live chat updates
app.get('/livechat', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const client = { id: Date.now(), res };
  app.locals.clients.push(client);

  // Remove the client when the connection is closed
  req.on('close', () => {
    peopleonthesite = peopleonthesite - 1;
  });
});

// Function to send SSE updates to all connected clients
function sendSSEUpdate(data) {
  app.locals.clients.forEach((client) => {
    client.res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}

// Function to validate date format
function isValidDate(dateString) {
  // Regular expression to match date format (YYYY-MM-DD)
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  return dateString.match(datePattern);
}
async function isSameMonthAsCountdown() {
  const date = new Date();

  // Get the current time in milliseconds
  const currentTimeMillis = date.getTime();

  // Calculate the offset for UTC+14 in milliseconds
  const offsetMillis = 14 * 60 * 60 * 1000;

  // Create a new Date object adjusted for the UTC+14 timezone
  const utcPlus14Date = new Date(currentTimeMillis + offsetMillis);

  const filename = 'route2025final.tsv';

  try {
    const data = await fspromises.readFile(filename, 'utf8');
    const lines = data.split('\n');

    if (lines.length > 4) {
      const items = lines[4].split('\t');

      const unixTimeStr = items[1];

      const unixTime = parseInt(unixTimeStr, 10);
      if (isNaN(unixTime)) {
        return false;
      }

      const countdownDate = new Date(unixTime * 1000);

      const isSameMonth = utcPlus14Date.getUTCMonth() === countdownDate.getUTCMonth();
      const isBeforeDec25 = utcPlus14Date.getUTCDate() < 29;

      return isSameMonth && isBeforeDec25;
    } else {
      return false;
    }
  } catch (err) {
    return false;
  }
}


// Call the function and log the result
// Read the certificate files
const options = {
  cert: fs.readFileSync('cert.pem'),
  ca: fs.readFileSync('ca.pem'),
  key: fs.readFileSync('key.pem')
};

// Create an HTTPS http
const server = https.createServer(options, app);
const wss = new WebSocket.Server({ server });

let activeUsers = 0;
var basketsDelivered
// WebSocket connection handler
wss.on('connection', (ws) => {
  activeUsers++;
  //  console.log('New user connected. Active users:', activeUsers);

  // Handle WebSocket connection close event
  ws.on('close', () => {
    activeUsers--;
    // console.log('User disconnected. Active users:', activeUsers);
  });
});

// Route to return the number of active users"/""
app.get('/getactiveusers', (req, res) => {
  res.json({ activeUsers });
});

// Endpoint: /cookiereset
app.get('/cookiereset', (req, res) => {
  // Get the current year
  const currentYear = new Date().getUTCFullYear();

  // Set the date to January 1st of the next year in UTC
  const nextYearStart = new Date(Date.UTC(currentYear + 1, 0, 1));

  // Convert to Unix timestamp in milliseconds
  const unixTimeMs = nextYearStart.getTime();

  // Return the result
  res.json({ resetTime: unixTimeMs });
});

app.get("/getcountdowndate", (req, res) => {
  const file = 'route2025final.tsv';
  const searchString = "1\t1\t1\tSanta's Village\tp";

  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading file');
      return;
    }

    // Split data by lines
    const lines = data.split('\n');

    // Find the index of the line after the specified search string
    const startIndex = lines.findIndex(line => line.startsWith(searchString));
    if (startIndex === -1 || startIndex === lines.length - 1) {
      res.status(404).send("Line not found or no next line available.");
      return;
    }

    // Get the next line
    const nextLine = lines[startIndex + 1];
    if (!nextLine) {
      res.status(404).send("No next line found.");
      return;
    }

    // Split the next line by tabs to get the first item
    const items = nextLine.split('\t');
    const firstItem = items[0]; // Change index based on your column position

    // Parse the first item as a Unix timestamp and add 1 second
    const timestamp = parseInt(firstItem, 10) + 1;

    res.send(timestamp.toString());
  });
});

// Endpoint: /linequeue
app.get('/linequeue', (req, res) => {
    const file = path.join(__dirname, 'route2025final.tsv');
    const searchString = "1\t1\t1\tSanta's Village\tp";

    fs.readFile(file, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error reading file');
            return;
        }

        // Split data by lines
        const lines = data.split('\n');

        // Find the index of the line after the specified search string
        const startIndex = lines.findIndex(line => line.startsWith(searchString));
        if (startIndex === -1 || startIndex === lines.length - 1) {
            res.status(404).send("Line not found or no next line available.");
            return;
        }

        // Get the next line
        const nextLine = lines[startIndex + 1];
        if (!nextLine) {
            res.status(404).send("No next line found.");
            return;
        }

        // Split the next line by tabs to get the first item
        const items = nextLine.split('\t');
        const firstItem = items[0]; // Change index based on your column position

        // Parse the first item as a Unix timestamp and add 1 second
        const timestamp = parseInt(firstItem, 10) + 1;

        // Calculate probability based on closeness to the current time
        const currentTime = 1735020000000 / 1000; // Current time in seconds
        const timeDifference = Math.abs(timestamp - 10800 - currentTime);
        let probability;

        if (timeDifference <= 3) {
            probability = Math.floor(30 - (timeDifference / 3) * 29);
        } else if (timeDifference <= 10) {
            probability = Math.floor(3 + (10 - timeDifference) * 0.3);
        } else {
            probability = 1;
        }

        res.json({ queueinline: probability });
    });
});

function calculateBasketsDelivered(city, timeLeft) {
  const deliveryRate = 0.001; // Assuming a delivery rate of 1 basket per second
  const basketsDelivered = city.basketsdelivered + deliveryRate * (timeLeft);
  return Math.min(basketsDelivered, cities[currentIndex].basketsdelivered);
}
let isscheduled = true;
// Function to execute a task
function executeTask(taskUrl) {
  // console.log(`Executing task: ${taskUrl}`);

  // Perform specific actions based on the task URL
  if (taskUrl === "/restarttracker") {
    currentIndex = 1;
    saveIndexToFile(); // Save the index to file
  } else if (taskUrl === "/resetbaskets" || taskUrl === "/resetbaskets_next") {
    currentIndex = 1;
    fs.writeFileSync("giftsdelivered.json", "[]");
  } else if (taskUrl === "/unlock") {
    isLocked = false;
    sendTrackerEvent({ unlocked: true });
    saveTrackerStatusToFile(true);
  } else if (taskUrl === "/message1set") {
    // Perform actions for setting message 1
    fs.writeFile(
      "message.txt",
      "Weather on Easter Island is indicating perfect weather for traveling.",
      (err) => {
        if (err) {
          console.error("Error setting message 1:", err);
        } else {
          sendTrackerEvent({
            messageupdate:
              "Weather on Easter Island is indicating perfect weather for traveling.",
          });
        }
      }
    );
  } else if (taskUrl === "/message2set") {
    // Perform actions for setting message 2
    fs.writeFile(
      "message.txt",
      "Are you ready? Easter Bunny is expected to launch within the hour.",
      (err) => {
        if (err) {
          console.error("Error setting message 2:", err);
        } else {
          sendTrackerEvent({
            messageupdate:
              "Are you ready? Easter Bunny is expected to launch within the hour.",
          });
        }
      }
    );
  } else if (taskUrl === "/message3set") {
    // Perform actions for setting message 3
    fs.writeFile("message.txt", "Easter Bunny is about to launch.", (err) => {
      if (err) {
        console.error("Error setting message 3:", err);
      } else {
        sendTrackerEvent({
          messageupdate: "Easter Bunny is about to launch.",
        });
      }
    });
  } else if (taskUrl === "/message4set") {
    // Perform actions for setting message 4
    fs.writeFile("message.txt", "Easter Bunny is Launching!", (err) => {
      if (err) {
        console.error("Error setting message 4:", err);
      } else {
        sendTrackerEvent({
          messageupdate: "Easter Bunny is Launching!",
        });
      }
    });
  } else if (taskUrl === "/starttracker") {
    dosomethingtorefresh();
    startTracker("route2025.tsv");
    res.send("Tracker started.");
    started = true;
    readytoshowendedscreen = true;
    sendTrackerEvent({ trackerStarted: true });
  } else if (taskUrl === "/endtracker") {
    // Perform actions for ending the tracker
    isTrackerStarted = false;
    clearInterval(trackerInterval);
    sendTrackerEvent({ ended: true });
    dosomethingtorefresh()
    saveTrackerStatusToFile(false);
  } else if (taskUrl === "/restarttracker_next") {
    currentIndex = 1;
    saveIndexToFile(); // Save the index to file
  } else if (taskUrl === "/lock") {
    // Perform actions for locking
    isLocked = true;
    sendTrackerEvent({ locked: true });
    saveTrackerStatusToFile(true);
  }
}

function scheduleTasks() {
  setInterval(() => {
    // Get the current time in UTC
    const currentTime = new Date();
    const currentHour = currentTime.getUTCHours();
    const currentMinute = currentTime.getUTCMinutes();
    const currentSecond = currentTime.getUTCSeconds();

    // Iterate over each task and check if it's time to execute
    Object.entries(taskIntervals).forEach(([taskUrl, interval]) => {
      // Extract scheduled hour, minute, and second from the interval
      const scheduledHour = Math.floor(interval / (60 * 60 * 1000));
      const scheduledMinute = Math.floor(
        (interval % (60 * 60 * 1000)) / (60 * 1000)
      );
      const scheduledSecond = Math.floor((interval % (60 * 1000)) / 1000);

      // Check if the current time matches the scheduled time for the task
      if (
        currentHour === scheduledHour &&
        currentMinute === scheduledMinute &&
        currentSecond === scheduledSecond &&
        !isscheduled
      ) {
        executeTask(taskUrl);
        isscheduled = true;
      }
    });

    // Reset isscheduled flag after each iteration
    isscheduled = false;
  }, 1000); // Check every second
}

// Function to save the current index to a file
function saveIndexToFile() {
  fs.writeFileSync("currentIndex.txt", currentIndex.toString());
  // console.log("Current index saved to file:", currentIndex);
}

async function dosomethingtorefresh() {
  sendTrackerEvent({ refresh: true });
}
async function readCitiesFromFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      const lines = data.trim().split("\n");
      cities = lines.map((line) => {
        const [unixarrivalarrival, unixarrival, unixdeparture, city, country, cc, timezone1, basketsdelivered, carrots_eaten, latitude, longitude, pop_num, pop_year, Elevation_Meter, Arrival_Stoppage_Time, Timezone, Wikipedia_attr, wikipedia_link] = line.split("\t");
        return {
          unixarrivalarrival,
          unixarrival,
          unixdeparture,
          city,
          country,
          cc,
          timezone1,
          basketsdelivered,
          carrots_eaten,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          pop_num,
          pop_year,
          Elevation_Meter,
          Arrival_Stoppage_Time,
          Timezone,
          Wikipedia_attr,
          wikipedia_link
        };
      });

      // console.log("Cities loaded:", cities.length);
      resolve();
    });
  });
}
async function readCitiesFromFile2(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      const lines = data.trim().split("\n");
      cities2 = lines.map((line) => {
        const [unixarrivalarrival, unixarrival, unixdeparture, city, country, cc, timezone1, basketsdelivered, carrots_eaten, latitude, longitude, pop_num, pop_year, Elevation_Meter, Arrival_Stoppage_Time, Timezone, Wikipedia_attr, wikipedia_link] = line.split("\t");
        return {
          unixarrivalarrival,
          unixarrival,
          unixdeparture,
          city,
          country,
          cc,
          timezone1,
          basketsdelivered,
          carrots_eaten,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          pop_num,
          pop_year,
          Elevation_Meter,
          Arrival_Stoppage_Time,
          Timezone,
          Wikipedia_attr,
          wikipedia_link
        };
      });

     console.log("Cities loaded:", cities.length);
      resolve();
    });
  });
}
// Endpoint to delete entries after a specified city
app.get('/deleteafter', (req, res) => {
  const filePath2 = path.join(__dirname, 'giftsdelivered.json');

  const city = req.query.city;

  if (!city) {
    return res.status(400).send('City query parameter is required');
  }

  fs.readFile(filePath2, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).send('Error reading the file');
    }

    let giftsDelivered = JSON.parse(data);
    const cityIndex = giftsDelivered.findIndex(entry => entry.city === city);

    if (cityIndex === -1) {
      return res.status(404).send('City not found');
    }

    giftsDelivered = giftsDelivered.slice(0, cityIndex + 1);

    fs.writeFile(filePath2, JSON.stringify(giftsDelivered, null, 2), 'utf8', err => {
      if (err) {
        return res.status(500).send('Error writing to the file');
      }

      res.send(`Entries after the city ${city} have been deleted`);
    });
  });
});
// Function to read the current index from a file
async function readIndexFromFile() {
  try {
    const indexData = await fs.promises.readFile("currentIndex.txt", "utf8");
    const currentIndex = parseInt(indexData);
    // console.log("Current index read from file:", currentIndex);
    return currentIndex;
  } catch (err) {
    console.error("Error reading index from file:", err);
    return 0; // Return 0 if there's an error reading the file
  }
}

// Function to send mass email to everyone in the mailing list
async function sendMassEmail(html) {
  try {
    // Read existing emails from the file asynchronously
    const fileData = await fspromises.readFile(EMAILS_FILE, 'utf-8'); // Correct usage here
    const existingEmails = JSON.parse(fileData);

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: 'tracker@master-trackers.xyz',
        pass: '9MWX3Q5GUE04' // Replace with your Zoho app password
      },
      tls: {
        rejectUnauthorized: false // Ignore self-signed certificate errors
      }
    });
 // Loop through each email in the mailing list and send the email
 for (const email of existingEmails) {
 /* await transporter.sendMail({
    from: 'tracker@master-trackers.xyz',
    to: email,
    subject: 'Hourly Update for the Master Santa Tracker',
    html: html + `<br/><a href="http://master-trackers.xyz/unsubscribe?email=${email}" target="_blank">Unsubscribe</a>`
  });
*/
  console.log(`Email sent to ${email}`);
}

console.log('Mass email sent successfully to all recipients');
} catch (error) {
console.error('Error sending mass email:', error);
throw error; // Rethrow for handling in the caller
}
}
app.get('/sendmassemail', async (req, res) => {
  const html = req.query.html;

  if (!html) {
    return res.status(400).json({ error: 'HTML code is required' });
  }

  try {
    await sendMassEmail(html);
    return res.json({ message: 'Mass email sent successfully' });
  } catch (error) {
    console.error('Error sending mass email:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
// Function to find a city by its name in the cities array
function findCityByName(cityName) {
  return cities.find(city => city.city === cityName);
}
async function fetchISSLocation() {
  try {
    const response = await fetch('http://api.open-notify.org/iss-now.json');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    const { latitude, longitude } = data.iss_position;
    return { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
  } catch (error) {
    console.error('Error fetching ISS location:', error.message);
    return null;
  }
}

async function startTracker(filePath) {
  if (!isTrackerStarted) {
    try {
      await readCitiesFromFile(filePath); // Wait for cities to be loaded
      currentIndex = await readIndexFromFile(); // Read index from file
      isTrackerStarted = true;
      readytoshowendedscreen = true;

      // Using spawn to start the async task
      try {
        const issLocation = await fetchISSLocation(); // Function to fetch ISS coordinates
        if (issLocation) {
          const issCity = findCityByName("International Space Station"); // Find ISS city in cities array
          if (issCity) {
            // Update the latitude and longitude of the ISS city
            issCity.latitude = issLocation.latitude;
            issCity.longitude = issLocation.longitude;

            // Save updated cities back to file
            await saveCitiesToFile(filePath, cities);
            console.log("ISS city coordinates updated:", issLocation);
          } else {
            console.error("ISS city not found in cities array.");
          }
        } else {
          console.error("Failed to fetch ISS location.");
        }
      } catch (error) {
        console.error("Error updating ISS coordinates:", error);
      }
      // Function to update ISS coordinates every 30 minutes
      setInterval(async () => {
        try {
          const issLocation = await fetchISSLocation(); // Function to fetch ISS coordinates
          if (issLocation) {
            const issCity = findCityByName("International Space Station"); // Find ISS city in cities array
            if (issCity) {
              // Update the latitude and longitude of the ISS city
              issCity.latitude = issLocation.latitude;
              issCity.longitude = issLocation.longitude;

              // Save updated cities back to file
              await saveCitiesToFile(filePath, cities);
              console.log("ISS city coordinates updated:", issLocation);
            } else {
              console.error("ISS city not found in cities array.");
            }
          } else {
            console.error("Failed to fetch ISS location.");
          }
        } catch (error) {
          console.error("Error updating ISS coordinates:", error);
        }
      }, 30 * 60 * 1000); // Update every 30 minutes (30 * 60 * 1000 milliseconds)

      // Rest of your existing tracker logic...
      if (currentIndex > 1) {
        for (let i = 0; i < currentIndex - 1; i++) {
          addToGiftsDelivered(cities[i]); // Add a basket for each city before the current index
        }
      }

      sendNextCity();

      // Existing tracker interval for updates every second
      trackerInterval = setInterval(() => {
        sendTrackerUpdate();
        const now = new Date();
        if (now.getMinutes() === 0 && now.getSeconds() === 0) {
          if (timeLeft > 1800 || currentIndex <= 4) {
            console.log("Didn't send hourly update though because tracker has not started.");
          } else {
            const html = `<div style="font-family: Arial, sans-serif; text-align: center;">
              <h2>Hourly Update</h2>
              <img src="https://example.com/easter_bunny_image.png" alt="Easter Bunny" style="max-width: 100%; height: auto;">
              <p></p>`;

            sendMessageToWebhook2(lastcountries);
            sendMassEmail(html);
            lastcountries = "Bunny went to the places of: ";
          }
        }
      }, 1000); // Update tracker every second

      sendTrackerStartEvent(); // Send SSE event when the tracker starts
    } catch (error) {
      console.error("Error loading cities:", error);
    }
  }
}

// Endpoint to convert TSV to JSON
app.get('/route', (req, res) => {
  const filePath = path.join(__dirname, 'route2025final.tsv');

  // Read the TSV file
  fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
          console.error('File read error:', err);
          return res.status(500).json({ error: 'Failed to read file' });
      }

      try {
          // Convert TSV to JSON
          const jsonData = tsv.parse(data);
          res.json(jsonData);
      } catch (error) {
          console.error('Parsing error:', error);
          res.status(500).json({ error: 'Failed to convert TSV to JSON' });
      }
  });
});
// Endpoint to convert TSV to JSON
app.get('/images', (req, res) => {
  res.sendFile(path.join(__dirname, "src", "assets", "images.json"));
});
let presentsDelivered;
function updatePresentsDelivered(currentIndex) {
  presentsDelivered = Math.floor((currentIndex / cities.length) * maxpresents); // Calculate presents delivered
  // Update presents delivered every 10 milliseconds
  presentsDelivered = Math.floor((currentIndex / cities.length) * maxpresents); // Recalculate presents delivered
  sendTrackerEvent({ presentsDelivered: presentsDelivered }); // Send server update
}
var timeLeft;
function sendNextCity() {
  if (isTrackerStarted && currentIndex < cities.length) {
    let currentTime = Date.now();
    let nextCityIndex = currentIndex;

    // Find the index of the next city with a departure time greater than the current time
    while (nextCityIndex < cities.length && cities[nextCityIndex].unixdeparture * 1000 <= currentTime) {
      const city = cities[nextCityIndex];

      // Update the baskets delivered count for cities whose departure time has already passed
      addToGiftsDelivered(city);

      nextCityIndex++;
    }

    // If all cities have departure times that have passed, end the tracker
    if (nextCityIndex >= cities.length) {
      isTrackerStarted = false;
      started = false;
      console.log("Tracker ended.");
      sendTrackerEvent({ trackerEnded: true }); // Send trackerEnded event
      app.set("currentCity", null);
      lastCity = null; // Reset lastCity when the tracker ends
      clearInterval(trackerInterval); // Stop the tracker interval
      return;
    }

    // Get the next city information
    const city = cities[nextCityIndex - 1];

    // Construct cityInfo object
    const cityInfo = {
      unixarrivalarrival: city.unixarrivalarrival,
      unixarrival: city.unixarrival,
      unixdeparture: city.unixdeparture,
      city: city.city,
      country: city.country,
      cc: city.cc,
      timezone1: city.timezone1,
      basketsdelivered: city.basketsdelivered,
      carrots_eaten: city.carrots_eaten,
      latitude: city.latitude,
      longitude: city.longitude,
      pop_num: city.pop_num,
      pop_year: city.pop_year,
      Elevation_Meter: city.Elevation_Meter,
      Arrival_Stoppage_Time: city.Arrival_Stoppage_Time,
      Timezone: city.Timezone,
      Wikipedia_attr: city.Wikipedia_attr,
      wikipedia_link: city.wikipedia_link
    };

    // Update currentIndex
    currentIndex = nextCityIndex;

    // Update lastcountries
    lastcountries = lastcountries + city.country + ", " + city.city + " | ";

    // Set currentCity
    app.set("currentCity", cityInfo);
    lastCity = cityInfo; // Update lastCity when sending a new city
    
    startTime = Date.now(); // Set the start time when sending a new city
    //  console.log("Sent next city:", cityInfo);

    // Save currentIndex to file
    saveIndexToFile();

    // Send message to webhook
    sendMessageToWebhook(
      "Satellites are saying that Santa Claus just left **" +
      city.city +
      ", " +
      city.country +
      "**"
    );

    // Send tracker event with newbasket and presentsDelivered
    sendTrackerEvent({ newbasket: cityInfo, presentsDelivered: cityInfo.basketsdelivered });

    // Send santaMoving event
    let zoomOut = currentIndex >= 37;
    sendTrackerEvent({ santaMoving: true, zoomOut: zoomOut });

    // Add delivered location to JSON file
    addToGiftsDelivered(cityInfo);
    // console.log(cityInfo);

    // Calculate time until next city's departure
    const currentTimeInSeconds = Math.floor(currentTime / 1000);
    const timeUntilDeparture = cities[currentIndex].unixdeparture - currentTimeInSeconds;
    timeLeft = Math.max(timeUntilDeparture, 0); // Ensure timeLeft is not negative


    // If timeLeft is negative, set it to 0
    if (timeLeft < 0) {
      timeLeft = 0;
    }

    // Log timeLeft
    // console.log("Time until next departure:", timeLeft, "seconds");

    // Schedule next city sending after timeLeft seconds
    setTimeout(sendNextCity, timeLeft * 1000);
  } else {
    // If currentIndex is equal to or greater than cities.length, end the tracker
    isTrackerStarted = false;
    //  console.log("Tracker ended.");
    sendTrackerEvent({ trackerEnded: true }); // Send trackerEnded event
    app.set("currentCity", null);
    lastCity = null; // Reset lastCity when the tracker ends
    clearInterval(trackerInterval); // Stop the tracker interval
  }
}


// Endpoint to get the last city coordinates
app.get("/getlastcords", (req, res) => {
  if (lastCity) {
    res.json({
      latitude: lastCity.latitude,
      longitude: lastCity.longitude
    });
  } else {
    res.status(404).json({ error: "Last city coordinates not found" });
  }
});


// Function to calculate the distance between two points using the Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function getTimeUntilArrival(latitude, longitude) {
  return new Promise((resolve, reject) => {
    fs.readFile('route2025final.tsv', 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      const lines = data.trim().split('\n');
      let minDistance = Number.MAX_SAFE_INTEGER;
      let nearestCity = null;
      let nearestDepartureTime = null;

      lines.forEach(line => {
        const [a1, a2, departureUnix, city, a3, a4, a5, a6, a7, lat, lon] = line.split('\t');
        const cityLatitude = parseFloat(lat);
        const cityLongitude = parseFloat(lon);
        const cityDepartureTime = parseInt(departureUnix); // Convert departure time to integer
        const distance = calculateDistance(latitude, longitude, cityLatitude, cityLongitude);

        // Check if city is nearest or if it's equally near but departs later
        if (distance < minDistance || (distance === minDistance && cityDepartureTime > nearestDepartureTime)) {
          minDistance = distance;
          nearestCity = city;
          nearestDepartureTime = cityDepartureTime;
        }
      });

      // Calculate time until arrival using nearest city's departure time
      const currentTime = unixTime
      const timeUntilArrival = nearestDepartureTime - currentTime;

      resolve({ nearestCity, timeUntilArrival });
    });
  });
}

function getTimeUntilArrival2(latitude, longitude) {
  return new Promise((resolve, reject) => {
    fs.readFile('route2025final.tsv', 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      const lines = data.trim().split('\n');
      let minDistance = Number.MAX_SAFE_INTEGER;
      let nearestCity = null;
      let nearestDepartureTime = null;

      lines.forEach(line => {
        const [a1, a2, departureUnix, city, a3, a4, a5, a6, a7, lat, lon] = line.split('\t');
        const cityLatitude = parseFloat(lat);
        const cityLongitude = parseFloat(lon);
        const cityDepartureTime = parseInt(departureUnix); // Convert departure time to integer
        const distance = calculateDistance(latitude, longitude, cityLatitude, cityLongitude);

        // Check if city is nearest or if it's equally near but departs later
        if (distance < minDistance || (distance === minDistance && cityDepartureTime > nearestDepartureTime)) {
          minDistance = distance;
          nearestCity = city;
          nearestDepartureTime = cityDepartureTime;
        }
      });

      // Calculate time until arrival using nearest city's departure time
      const currentTime = unixTime
      const timeUntilArrival = nearestDepartureTime;

      resolve({ nearestCity, timeUntilArrival });
    });
  });
}


// Endpoint to get time until arrival for the nearest city
app.get('/gettimeuntilarrival', (req, res) => {
  const latitude = parseFloat(req.query.lat);
  const longitude = parseFloat(req.query.long);

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: 'Invalid latitude or longitude' });
  }

  getTimeUntilArrival(latitude, longitude)
    .then(({ nearestCity, timeUntilArrival }) => {
      res.json({ nearestCity, timeUntilArrival });
    })
    .catch(err => {
      console.error('Error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
});
// Endpoint to get time until arrival for the nearest city
app.get('/gettimeofarrival', (req, res) => {
  const latitude = parseFloat(req.query.lat);
  const longitude = parseFloat(req.query.long);

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: 'Invalid latitude or longitude' });
  }

  getTimeUntilArrival2(latitude, longitude)
    .then(({ nearestCity, timeUntilArrival }) => {
      res.json({ nearestCity, timeUntilArrival });
    })
    .catch(err => {
      console.error('Error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
});
// Endpoint to set message 1
app.get("/message1set", async (req, res) => {
  dosomethingtorefresh();
  try {
    await fs.writeFile(
      "message.txt",
      "Weather on Easter Island is indicating perfect weather for traveling.",
      (err) => {
        if (err) {
          res.status(500).send("Internal Server Error");
        } else {
          res.send("Message 1 set.");
          sendTrackerEvent({
            messageupdate:
              "Weather on Easter Island is indicating perfect weather for traveling.",
          });
          sendMessageToWebhook2("Weather on Easter Island is indicating perfect weather for traveling.");
        }
      }
    );
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.get('/getmaxpresents', (req, res) => {
  const FILENAME = 'route2025final.tsv';
  const filePath = path.join(__dirname, FILENAME);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Error reading file' });
    }

    const lines = data.trim().split('\n');
    const headers = lines[0].split('\t');
    const eggsDeliveredIndex = headers.indexOf('Eggs Delivered');

    let lastLineWithContent;
    for (let i = lines.length - 1; i > 0; i--) {
      const columns = lines[i].split('\t');
      if (columns[eggsDeliveredIndex]) {
        lastLineWithContent = columns;
        break;
      }
    }

    if (!lastLineWithContent) {
      return res.status(404).json({ error: 'No content found in file' });
    }

    const eggsDelivered = lastLineWithContent[eggsDeliveredIndex];
    res.json({ basketDelivered: eggsDelivered });
  });
});

// Endpoint to get the index
app.get("/getindex", async (req, res) => {
  // Send a JSON response with the value of currentIndex
  const index = await readIndexFromFile();
  res.json({ index });
});


// Endpoint to set message 2
app.get("/message2set", async (req, res) => {
  dosomethingtorefresh();
  try {
    await fs.writeFile(
      "message.txt",
      "Are you ready? Easter Bunny is expected to launch within the hour.",
      (err) => {
        if (err) {
          res.status(500).send("Internal Server Error");
        } else {
          res.send("Message 2 set.");
          sendTrackerEvent({
            messageupdate:
              "Are you ready? Easter Bunny is expected to launch within the hour.",
          });
          sendMessageToWebhook2("Are you ready? Easter Bunny is expected to launch within the hour.");
        }
      }
    );
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});
// Object to hold live announcements
// Array to hold SSE clients
// Array to hold SSE clients
let sseClients = [];

// Table of allowed IP addresses
const allowedIPs = new Set(['104.3.193.114']); // Example list of allowed IP addresses

// Function to send SSE updates to clients
function sendSSEUpdate(announcement) {
  sseClients.forEach(client => {
    client.res.write(`data: ${JSON.stringify(announcement)}\n\n`);
  });
}

// Middleware for SSE endpoint
app.get('/getliveannouncements', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  // Add the client to the SSE clients array
  const client = { id: Date.now(), res };
  sseClients.push(client);

  // Remove the client when the connection closes
  req.on('close', () => {
    //  console.log('SSE client disconnected');
    sseClients = sseClients.filter(c => c.res !== res);
  });
});

// Middleware for sending live announcement
app.get('/sendliveannouncement', (req, res) => {
  const clientIP = req.ip; // Get client's IP address from request
  const adminIp = req.query.adminip;
  const time = parseInt(req.query.time);
  const message = req.query.message;
  const country = req.query.country || null;
  const targetIp = req.query.targetipaddress || null;



  const announcement = {
    adminIp,
    time,
    message,
    country,
    targetIp
  };

  // Send SSE updates to all connected SSE clients
  sendSSEUpdate(announcement);

  res.writeHead(200);
  res.end('Announcement sent successfully');
});

// Start the server


// Endpoint to set message 3
app.get("/message3set", async (req, res) => {
  dosomethingtorefresh();
  try {
    await fs.writeFile(
      "message.txt",
      "Easter Bunny is about to launch.",
      (err) => {
        if (err) {
          res.status(500).send("Internal Server Error");
        } else {
          res.send("Message 3 set.");
          sendTrackerEvent({
            messageupdate: "Easter Bunny is about to launch.",
          });
          sendMessageToWebhook2("Easter Bunny is about to launch.");
        }
      }
    );
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

// Endpoint to set message 4
app.get("/message4set", async (req, res) => {
  dosomethingtorefresh();
  try {
    await fs.writeFile("message.txt", "Easter Bunny is Launching!", (err) => {
      if (err) {
        res.status(500).send("Internal Server Error");
      } else {
        res.send("Message 4 set.");
        sendTrackerEvent({ messageupdate: "Easter Bunny is Launching!" });
      }
    });
    sendMessageToWebhook2("Easter Bunny is Launching!");
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});
app.get("/refreshall", async (req, res) => {
  setTimeout(() => {
    sendTrackerEvent({ refresh: true });
    res.send("Refresh initiated successfully.");
  }, 5000); // 1000 milliseconds = 1 second
});

function addToGiftsDelivered(cityInfo) {
  try {
    const fileName = "giftsdelivered.json";
    let data = [];
    if (fs.existsSync(fileName)) {
      data = JSON.parse(fs.readFileSync(fileName));
    }

    // Check if the city already exists in the data
    const cityExists = data.some(item => item.city === cityInfo.city);
    if (!cityExists) {
      data.push(cityInfo);
      fs.writeFileSync(fileName, JSON.stringify(data, null, 2));
     // console.log("Added to giftsdelivered.json:", cityInfo);
    } else {
      console.log("City already exists in giftsdelivered.json:", cityInfo.city);
    }
  } catch (error) {
    console.error("Error adding to giftsdelivered.json:", error);
  }
}

function sendTrackerUpdate() {
  const trackerUpdate = generateTrackerUpdate();
  app.locals.clients.forEach((client) => {
    client.res.write(`data: ${JSON.stringify(trackerUpdate)}\n\n`);
  //  console.log(`TRACKER UPDATING! ! data: ${JSON.stringify(trackerUpdate)}\n\n`)
   // handleSSE(JSON.stringify(trackerUpdate))
   
  });
}

function generateTrackerUpdate() {
  const currentCity = app.get("currentCity");
  const nextCityIndex = currentIndex;
  const nextCity = cities[nextCityIndex];
  const currentTime = Date.now();
  const elapsedTime = currentTime - startTime;

  if (currentCity && nextCityIndex && nextCity && currentTime && elapsedTime) {
    // Calculate the time left for the current city
    const currentTimeInSeconds = Math.floor(currentTime / 1000);
    const timeUntilDeparture = nextCity.unixdeparture - currentTimeInSeconds;
    timeLeft = Math.max(timeUntilDeparture, 0); // Ensure timeLeft is not negative





    // Create a new basket object with the next city's information
    const newBasket = {
      city: lastCity.city,
      country: lastCity.country,
      latitude: lastCity.latitude,
      longitude: lastCity.longitude,
      unixarrivalarrival: lastCity.unixarrivalarrival,
      unixarrival: lastCity.unixarrival,
      unixdeparture: lastCity.unixdeparture,
      prettyarrival: lastCity.prettyarrival,
      cc: lastCity.cc,
      timezone1: lastCity.timezone1,
      basketsdelivered: lastCity.basketsdelivered,
      carrots_eaten: lastCity.carrots_eaten,
      pop_num: lastCity.pop_num,
      pop_year: lastCity.pop_year,
      Elevation_Meter: lastCity.Elevation_Meter,
      Arrival_Stoppage_Time: lastCity.Arrival_Stoppage_Time,
      Timezone: lastCity.Timezone,
      Wikipedia_attr: lastCity.Wikipedia_attr,
      wikipedia_link: lastCity.wikipedia_link
    };

    return {
      currentCity,
      timeLeft,
      nextCity,
      lastCity, // Include lastCity in the tracker update
      presentsDelivered,
      newBasket,
    };
  }
}
app.get('/getlastcity', (req, res) => {
  const city = lastCity || "Santa's Village, North Pole";
  res.json({ lastCity: city });
});


function sendTrackerStartEvent() {
  app.locals.clients.forEach((client) => {
    client.res.write("event: trackerStart\n");
    client.res.write('data: {"trackerStarted": true}\n\n');
  });
}

app.get("/starttracker", (req, res) => {
  dosomethingtorefresh();
  startTracker("route2025final.tsv");
  res.send("Tracker started.");
  started = true;
  readytoshowendedscreen = true;
  sendTrackerEvent({ trackerStarted: true });
});

// Endpoint to reset the index to 0
app.get("/restarttracker", (req, res) => {
  dosomethingtorefresh();
  currentIndex = 1;
  saveIndexToFile(); // Save the index to file
  res.send("Tracker index reset.");
});

// Define a variable to track whether the site is locked
let isLocked = true;

// Endpoint to unlock the site
app.get("/unlock", (req, res) => {
  dosomethingtorefresh();
  isLocked = false;
  res.send("Site unlocked");
  sendTrackerEvent({ unlocked: true });
  saveTrackerStatusToFile(true);
});

// Endpoint to lock the site
app.get("/lock", (req, res) => {
  dosomethingtorefresh();
  isLocked = true;
  res.send("Site locked");
  sendTrackerEvent({ unlocked: false });
  saveTrackerStatusToFile(true);
});

// Endpoint to get yearly visits with visit data
app.get("/getyearlyvisits", (req, res) => {
  getVisitsWithData("year", (err, visits) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json({ visits: visits.length, visitData: visits });
    }
  });
});

// Endpoint to get monthly visits with visit data
app.get("/getmonthlyvisits", (req, res) => {
  getVisitsWithData("month", (err, visits) => {
    if (err) {
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json({ visits: visits.length, visitData: visits });
    }
  });
});

const currentDate = new Date(); // Assuming this is the current date

// Call the function and log the result
(async () => {
  const result = await isSameMonthAsCountdown();
  // console.log(result); // This will print true or false
})();
// Endpoint to get all values for the current year
app.get('/api/yearlyvisits/current', (req, res) => {
  fs.readFile(yearlyVisitsFile, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    console.log(isSameMonthAsCountdown(currentDate)); // Output: true or false
    const yearlyVisits = JSON.parse(data);
    const currentYear = new Date().getFullYear();
    const currentYearData = yearlyVisits.find(entry => entry.year === currentYear);

    if (!currentYearData) {
      res.status(404).json({ error: `No data found for year ${currentYear}` });
    } else {
      res.json(currentYearData);
    }
  });
});

// Endpoint to get all values for every year
app.get('/api/yearlyvisits/all', (req, res) => {
  fs.readFile(yearlyVisitsFile, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    const yearlyVisits = JSON.parse(data);
    res.json(yearlyVisits);
  });
});

// Helper function to read TSV file and get relevant data
async function readTSV(filePath) {
  const data = await fs.promises.readFile(filePath, "utf-8");
  const lines = data.trim().split("\n").map(line => line.split("\t"));
  return lines;
}

// Default route handler
app.get("/", async (req, res) => {
  peopleonthesite += 1;
  const ip = req.ip;
  const time = new Date().toISOString();
  const country = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  const visitData = { ip, time, country };
  const currentDate = new Date();
  console.log(isSameMonthAsCountdown(currentDate)); // Output: true or false
  // Log the visit data to SiteVisits.json
  fs.appendFile("SiteVisits.json", JSON.stringify(visitData) + "\n", (err) => {
    if (err) console.error("Error logging visit:", err);
  });

  // Clean up people count on user disconnection
  req.on("close", () => {
    peopleonthesite -= 1;
  });

  // Check if the user is on mobile
  const userAgent = req.headers["user-agent"];
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

  
// Get the current Unix timestamp
const currentTimestamp = Date.now();

// Check if preventcache is present and is within the last 30 minutes (1800 seconds)
const preventCacheParam = req.query.preventcache ? parseInt(req.query.preventcache, 10) : null;

if (!preventCacheParam || (currentTimestamp - preventCacheParam > 30 * 60 * 1000)) {
  // If preventcache is not present or is outside the last 30 minutes, add the current timestamp
  return res.redirect(`https://master-trackers.xyz?preventcache=${currentTimestamp}`);
}


  try {
    const lines = await readTSV("route2025final.tsv");
    const unixTime = parseInt(lines[3][0], 10); // Line 4, 1st item (index 3, 0)
    const lastUnixTime = parseInt(lines[lines.length - 1][0], 10); // Last line, 1st item (index -1, 0)
    const timeLeft = (unixTime * 1000) - Date.now(); // Calculate time left in milliseconds
    const isSameMonth = await isSameMonthAsCountdown();

    if (!isSameMonth) {
      return res.sendFile(path.join(__dirname, "src", "pages", "comeback.html"));
    } else {
      // If locked, check conditions for newgames.html and map.html
      console.log(timeLeft);
      if (timeLeft > 3 * 60 * 60 * 1000) { // More than 3 hours
        return res.sendFile(path.join(__dirname, "src", "pages", "newgames.html"));
      } else if (timeLeft > 0) { // Within 3 hours but not yet
        return res.sendFile(path.join(__dirname, "src", "pages", "map.html"));
      } else if (timeLeft < 0) { // After the time
        if (lastUnixTime > unixTime) { // Check last line's time
          return res.sendFile(path.join(__dirname, "src", "pages", "map.html"));
        } else {
          return res.sendFile(path.join(__dirname, "src", "pages", "map.html"));
        }
      } else {
        return res.sendFile(path.join(__dirname, "src", "pages", "newgames.html"));
      }
    }
  } catch (error) {
    console.error("Error checking countdown month:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Your other express setup code here...


// Endpoint to reset the baskets
app.get("/resetbaskets", (req, res) => {
  try {
    fs.writeFileSync("giftsdelivered.json", "[]");
    res.send("Baskets reset.");
  } catch (error) {
    console.error("Error resetting baskets:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/getbaskets", (req, res) => {
  try {
    // Read the contents of the giftsdelivered.json file
    const baskets = JSON.parse(fs.readFileSync("giftsdelivered.json"));

    // Filter out every 5th basket
    const filteredBaskets = baskets.filter(
      (basket, index) => (index + 1) % 1 === 0
    );

    res.json(filteredBaskets);
  } catch (error) {
    console.error("Error getting baskets:", error);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/getallbaskets", (req, res) => {
  try {
    // Read the contents of the giftsdelivered.json file
    const baskets = JSON.parse(fs.readFileSync("giftsdelivered.json"));

    // Filter out every 5th basket
    const filteredBaskets = baskets.filter(
      (basket, index) => (index + 1) % 1 === 0
    );

    res.json(filteredBaskets);
  } catch (error) {
    console.error("Error getting baskets:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Add a function to send SSE events
function sendTrackerEvent(data) {
  app.locals.clients.forEach((client) => {
    client.res.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}
// Function to save the tracker status to a file
function saveTrackerStatusToFile(status) {
  const data = JSON.stringify({ trackerStarted: status });
  fs.writeFileSync("ended.json", data);
}

// Function to check if the tracker is started from the file
function isTrackerStartedFromFile() {
  try {
    const data = fs.readFileSync("ended.json");
    const { trackerStarted } = JSON.parse(data);
    return trackerStarted;
  } catch (err) {
    // If file doesn't exist or any error occurs, return false
    return false;
  }
}

app.get("/endtracker", (req, res) => {
  isTrackerStarted = false;
  console.log("Tracker ended.");
  app.set("currentCity", null);
  lastCity = null; // Reset lastCity when the tracker ends
  res.send("Tracker ended.");
  currentIndex = 0;
  started = false;
  saveIndexToFile(); // Save the index to file
  sendTrackerEvent({ trackerEnded: true });
  dosomethingtorefresh()
  // Save the tracker status to file
  saveTrackerStatusToFile(false);
});
app.get("/checktrackerstatus", (req, res) => {
  const trackerStarted = isTrackerStartedFromFile();
  res.send(`Tracker is ${trackerStarted ? "started" : "not started"}`);
});

app.get("/updates", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const client = { id: Date.now(), res };
  if (!app.locals.clients) {
    app.locals.clients = [];
  }
  app.locals.clients.push(client);
});
app.get("/fetchbaskets", (req, res) => {
  try {
    // Read the contents of the giftsdelivered.json file
    const baskets = JSON.parse(fs.readFileSync("giftsdelivered.json"));

    // Filter the baskets array to show every 7th basket
    const filteredBaskets = baskets.filter((basket, index) => (index + 1) % 1 === 0);

    res.json(filteredBaskets); // Send the filtered baskets as JSON response
  } catch (error) {
    console.error("Error fetching baskets:", error);
    res.status(500).send("Internal Server Error");
  }
});
const mp3Path = path.join(__dirname, 'src', 'assets', 'christmasstreamraw.mp3');
const startTime2 = Date.now();


// Function to get the current stream position in seconds
function getCurrentPosition() {
    const elapsed = (Date.now() - startTime2) / 1000; // Elapsed time in seconds
    return elapsed;
}

// Get the size and duration of the MP3 file
const stat = fs.statSync(mp3Path);
const fileSize = stat.size;
const mp3Duration = 2306; // Assume the MP3 is 300 seconds (5 minutes) long for this example

// Route to stream the MP3 starting at the current timestamp
app.get('/assets/christmasstream', (req, res) => {
    const currentTime = getCurrentPosition() % mp3Duration; // Current time within the MP3 duration
    const startByte = Math.floor((currentTime / mp3Duration) * fileSize); // Calculate the starting byte

    const head = {
        'Content-Type': 'audio/mpeg',
        'Content-Length': fileSize - startByte, // Stream the remaining part of the file
    };

    res.writeHead(200, head);

    const stream = fs.createReadStream(mp3Path, { start: startByte });
    stream.pipe(res);
});

app.get("/admin", (req, res) => {

  res.sendFile(path.join(__dirname, "src", "pages", "controlpanel.html"));
});
app.get("/refresherpage", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "pages", "refreshtokeepup.html"));
});
app.get("/newdomain", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "pages", "newdomain.html"));
});
app.get("/donationiframe", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "pages", "donationiframe.html"));
});
app.get("/embed/settings", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "pages", "settings.html"));
});
app.get("/en-us/embed/ended.html", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "pages", "ended.html"));
}); // Endpoint to get the current message
app.get("/en-us/embed/countdownpage", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "pages", "newgames.html"));
}); // Endpoint to get the current message
app.get("/which-list-am-i-on", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "assets", "naughtyornice.html"));
}); // Endpoint to get the current message

app.get("/en-us/embed/index.html", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "pages", "index.html"));
});
app.get("/en-us/embed/inpreparation.html", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "pages", "inpreparation.html"));
});
app.use('/assets', express.static(path.join(__dirname, 'src', 'assets')));
app.use('/scripts', express.static(path.join(__dirname, 'src', 'scripts', 'mini')));

app.get("/en-us/embed/localtime", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "pages", "localtime.html"));
});
// Endpoint to return current Unix time in milliseconds
app.get('/unixtime', (req, res) => {
  const unixTimeInMilliseconds = Date.now();
  res.json({ unixTime: unixTimeInMilliseconds });
});
app.get("/en-us/embed/map", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "pages", "map.html"));
});
app.get("/map", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "pages", "map.html"));
});
app.get("/en-us/embed/losttrack", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "pages", "losttrack.html"));
});
app.get("/en-us/embed/tracker", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "pages", "map.html"));
});
app.get("/en-us/embed/cesium", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "pages", "cesiumtracker.html"));
});
app.get("/en-us/embed/2dtracker", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "pages", "tracker.html"));
});
app.get("/emails/subscribe", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "pages", "subscribeemail.html"));
});
app.get("/en", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "pages", "newgames.html"));
});
const scriptsDir = path.join(__dirname, 'src/scripts/mini');

app.get('/redocache', (req, res) => {
  fs.readdir(scriptsDir, (err, files) => {
    if (err) {
      return res.status(500).send('Error reading directory');
    }

    const renamedFiles = [];
    const manifest = {};

    files.forEach((file) => {
      const ext = path.extname(file);
      const base = path.basename(file, ext);
      const parts = base.split('.');

      if (parts.length > 1) {
        const newHash = Math.random().toString(36).substring(2, 10);
        const newFileName = `${parts[0]}.${newHash}${ext}`;
        const oldFilePath = path.join(scriptsDir, file);
        const newFilePath = path.join(scriptsDir, newFileName);

        // Read file contents
        const scriptContent = fs.readFileSync(oldFilePath, 'utf8');

        // Minify the script
        const minifiedContent = UglifyJS.minify(scriptContent).code;

        if (minifiedContent) {
          // Write minified content to the new file
          fs.writeFileSync(newFilePath, minifiedContent);

          // Rename the file and update the manifest
          renamedFiles.push(newFileName);
          manifest[parts[0]] = newFileName;

          // Delete the old file
          fs.unlinkSync(oldFilePath);
        } else {
          console.error(`Failed to minify ${file}`);
        }
      }
    });

    // Write the manifest file
    fs.writeFileSync(path.join(scriptsDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

    res.json({ message: 'Cache redone', files: renamedFiles });
  });
});

// Endpoint to lookup the full name of a script given the base name
app.get('/lookupscript', (req, res) => {
    const scriptName = req.query.script;

    if (!scriptName) {
        return res.status(400).send('Missing script parameter');
    }

    fs.readdir(scriptsDir, (err, files) => {
        if (err) {
            return res.status(500).send('Error reading directory');
        }

        const foundScript = files.find(file => file.startsWith(scriptName + '.'));
        
        if (foundScript) {
            res.json({ fullName: foundScript });
        } else {
            res.status(404).send('Script not found');
        }
    });
});
// Endpoint to get the current message
app.get("/getmessage", (req, res) => {
  // Read the contents of the message.txt file
  fs.readFile("message.txt", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading message:", err);
      res.status(500).send("Internal Server Error");
    } else {
      // Send the message as the response
      res.send(data);
    }
  });
});
// Handle 404 Not Found for all paths except "/", "/admin", and an empty path

app.use((req, res, next) => {
  const excludedPaths = ["/", "/admin", "", "/localtime", "/getip"];

  if (!excludedPaths.includes(req.path)) {
    res.status(404).sendFile(path.join(__dirname, "src", "pages", "404.html"));
  } else {
    next(); // Pass the request to the next middleware
  }
});


app.get('/getip', (req, res) => {
  const clientIp = req.socket.remoteAddress;
  res.send(`Your public IP address is: ${clientIp}`);
});
const hostname = '192.168.1.195'; // Listen on all available network interfaces
const port = process.env.PORT || 12310;
const defaultPort = 12310;

// ANSI escape codes for colors
// Function to check if a Unix timestamp has passed
const isPassed = (timestamp) => {
  return Date.now() > timestamp * 1000;
};
// ANSI escape codes for colors
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  underscore: "\x1b[4m",
  blink: "\x1b[5m",
  reverse: "\x1b[7m",
  hidden: "\x1b[8m",

  fg: {
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",
    crimson: "\x1b[38m" // Scarlet
  },
  bg: {
    black: "\x1b[40m",
    red: "\x1b[41m",
    green: "\x1b[42m",
    yellow: "\x1b[43m",
    blue: "\x1b[44m",
    magenta: "\x1b[45m",
    cyan: "\x1b[46m",
    white: "\x1b[47m",
    crimson: "\x1b[48m"
  }
};

// Simulating a loading system
const loadingText = 'Starting server';
let loadingIndex = 0;

const loadingInterval = setInterval(() => {
  process.stdout.write(`\r${colors.fg.blue}${loadingText}${'.'.repeat(loadingIndex % 4)}${colors.reset}`);
  loadingIndex++;
}, 500);
// Create HTTPS server
/*https.createServer(options, app).listen(12310, () => {
  console.log('HTTPS Server running on port 443');
});*/
server.listen(port, () => {
  clearInterval(loadingInterval);
  const border = '==============================';
  console.log(`\r${colors.fg.green}${border}${colors.reset}`);
  console.log(`${colors.fg.blue}${colors.bright}Server Status: ${colors.fg.green}Running${colors.reset}`);
  console.log(`${colors.fg.blue}Listening on port: ${colors.fg.yellow}${port}${colors.reset}`);
  console.log(`${colors.fg.green}${border}${colors.reset}`);

  // Explanation of static nature
  console.log(`${colors.fg.magenta}${colors.bright}Explanation:${colors.reset}`);
  console.log(`${colors.fg.cyan}The code inside the app.listen block is static because:${colors.reset}`);
  console.log(`${colors.fg.cyan}- The port number is a fixed value (const port = 3000).${colors.reset}`);
  console.log(`${colors.fg.cyan}- The messages printed to the console are hardcoded strings.${colors.reset}`);
  console.log(`${colors.fg.cyan}- No external data or inputs are influencing the output, making it consistent every time the server starts.${colors.reset}`);

  // Instructions for setting up port forwarding
  console.log(`${colors.fg.magenta}${colors.bright}Port Forwarding:${colors.reset}`);
  console.log(`${colors.fg.cyan}1. Access your router's web interface.${colors.reset}`);
  console.log(`${colors.fg.cyan}2. Find the port forwarding section.${colors.reset}`);
  console.log(`${colors.fg.cyan}3. Create a new port forwarding rule.${colors.reset}`);
  console.log(`${colors.fg.cyan}4. Enter your computer's local IP address.${colors.reset}`);
  console.log(`${colors.fg.cyan}5. Set the external and internal port to ${port}.${colors.reset}`);
  console.log(`${colors.fg.cyan}6. Choose TCP as the protocol.${colors.reset}`);
  console.log(`${colors.fg.cyan}7. Save the settings and restart your router if necessary.${colors.reset}`);

  // Explanation from the package description
  const packageDescription = "This project is something I have been working on for years. It's inspiration from Norad Santa Tracker and Google Santa Tracker. This should not be in the hands of anybody other than myself.";
  console.log(`${colors.fg.magenta}${colors.bright}About This Project:${colors.reset}`);
  console.log(`${colors.fg.cyan}${packageDescription}${colors.reset}`);
  console.log('Checking if Server Needs autostarted.')
  // Filepath to the TSV file
  const filepath = path.join(__dirname, 'route2025final.tsv');

  // Read the TSV file
  fs.readFile(filepath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      return;
    }

    // Split the file into lines
    const lines = data.split('\n');

    // Extract the first tab-separated object from line 4
    const line4 = lines[3];
    const unixTimestampLine4 = parseInt(line4.split('\t')[0], 10);

    // Extract the first tab-separated object from the last line
    const lastLine = lines[lines.length - 1];
    const unixTimestampLastLine = parseInt(lastLine.split('\t')[0], 10);

    // Check the conditions and call startTracker if met
   /* if (isPassed(unixTimestampLine4) && !isPassed(unixTimestampLastLine)) {
      console.log("Conditions met, tracker being started.")
      dosomethingtorefresh();
      currentIndex = 1;
      saveIndexToFile(); // Save the index to file
      console.log("Tracker index reset.");
      startTracker(filepath);
      started = true;
      readytoshowendedscreen = true;
      sendTrackerEvent({ trackerStarted: true });
    } else {
      console.log('Conditions not met, tracker not started.');
    }*/
  });
});
app.listen(12140, () => {
  const border = '==============================';
  console.log(`\r${colors.fg.green}${border}${colors.reset}`);
  console.log(`${colors.fg.blue}${colors.bright}Server Status: ${colors.fg.green}Running${colors.reset}`);
  console.log(`${colors.fg.blue}Listening on port: ${colors.fg.yellow}${port}${colors.reset}`);
  console.log(`${colors.fg.green}${border}${colors.reset}`);

  // Explanation of static nature
  console.log(`${colors.fg.magenta}${colors.bright}Explanation:${colors.reset}`);
  console.log(`${colors.fg.cyan}The code inside the app.listen block is static because:${colors.reset}`);
  console.log(`${colors.fg.cyan}- The port number is a fixed value (const port = 3000).${colors.reset}`);
  console.log(`${colors.fg.cyan}- The messages printed to the console are hardcoded strings.${colors.reset}`);
  console.log(`${colors.fg.cyan}- No external data or inputs are influencing the output, making it consistent every time the server starts.${colors.reset}`);

  // Instructions for setting up port forwarding
  console.log(`${colors.fg.magenta}${colors.bright}Port Forwarding:${colors.reset}`);
  console.log(`${colors.fg.cyan}1. Access your router's web interface.${colors.reset}`);
  console.log(`${colors.fg.cyan}2. Find the port forwarding section.${colors.reset}`);
  console.log(`${colors.fg.cyan}3. Create a new port forwarding rule.${colors.reset}`);
  console.log(`${colors.fg.cyan}4. Enter your computer's local IP address.${colors.reset}`);
  console.log(`${colors.fg.cyan}5. Set the external and internal port to ${port}.${colors.reset}`);
  console.log(`${colors.fg.cyan}6. Choose TCP as the protocol.${colors.reset}`);
  console.log(`${colors.fg.cyan}7. Save the settings and restart your router if necessary.${colors.reset}`);

  // Explanation from the package description
  const packageDescription = "This project is something I have been working on for years. It's inspiration from Norad Santa Tracker and Google Santa Tracker. This should not be in the hands of anybody other than myself.";
  console.log(`${colors.fg.magenta}${colors.bright}About This Project:${colors.reset}`);
  console.log(`${colors.fg.cyan}${packageDescription}${colors.reset}`);
  console.log('Checking if Server Needs autostarted.')
  // Filepath to the TSV file
  const filepath = path.join(__dirname, 'route2025final.tsv');

  // Read the TSV file
  fs.readFile(filepath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      return;
    }

    // Split the file into lines
    const lines = data.split('\n');

    // Extract the first tab-separated object from line 4
    const line4 = lines[3];
    const unixTimestampLine4 = parseInt(line4.split('\t')[0], 10);

    // Extract the first tab-separated object from the last line
    const lastLine = lines[lines.length - 1];
    const unixTimestampLastLine = parseInt(lastLine.split('\t')[0], 10);

    // Check the conditions and call startTracker if met
    if (isPassed(unixTimestampLine4) && !isPassed(unixTimestampLastLine)) {
      console.log("Conditions met, tracker being started.")
      dosomethingtorefresh();
      currentIndex = 1;
      saveIndexToFile(); // Save the index to file
      console.log("Tracker index reset.");
      startTracker(filepath);
      started = true;
      readytoshowendedscreen = true;
      sendTrackerEvent({ trackerStarted: true });
    } else {
      console.log('Conditions not met, tracker not started.');
    }
  });
})
