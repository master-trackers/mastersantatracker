let currenttimeunixsec = 0; // Server-based time
let lastServerTime = 0; // Last recorded server time (Unix timestamp in ms)
let lastClientTime = 0; // Last recorded client time (ms)

// Fetch the current Unix time from the server
async function fetchUnixTime() {
    try {
        const response = await fetch('/time');
        const data = await response.json();
        currenttimeunixsec = data.unixTime * 1000; // Convert to ms
        lastServerTime = currenttimeunixsec;
        lastClientTime = Date.now();
        // console.log(`Initial Sync - Server: ${currenttimeunixsec}, Client: ${lastClientTime}`);
    } catch (error) {
        console.error("Error fetching Unix time:", error);
    }
}

// Periodically check and adjust server-side time
function adjustServerTime() {
    const now = Date.now(); // Current client time
    const clientElapsed = now - lastClientTime; // Time elapsed on the client side
    const serverElapsed = currenttimeunixsec - lastServerTime; // Time elapsed on the server side

    // Compare elapsed times
    if (Math.abs(clientElapsed - serverElapsed) >= 1000) { // Only adjust if difference is significant (>= 1 second)
        const adjustment = clientElapsed - serverElapsed; // Calculate the difference
        currenttimeunixsec += adjustment; // Apply the adjustment to server time
        // console.log(`Drift detected. Adjustment: +${adjustment}ms`);
    } else {
        // console.log("No significant drift detected.");
    }

    // Update reference times
    lastServerTime = currenttimeunixsec;
    lastClientTime = now;
}

// Increment server time every second
function incrementUnixTime() {
    setInterval(() => {
        currenttimeunixsec += 1000; // Increment server time
        // console.log(`Incremented Unix Time: ${currenttimeunixsec}`);
    }, 1000);
}

// Periodically adjust for drift
function checkDriftPeriodically() {
    setInterval(() => {
        adjustServerTime();
    }, 5000);
}



// Initialize
fetchUnixTime().then(() => {
    incrementUnixTime();
    checkDriftPeriodically();
});
