const santaIframe = document.getElementById('iframe');
const originalSrc = santaIframe.src;

async function checkServer() {
  try {
    console.log("Checking server...");
    const response = await fetch('/sitemap.xml'); // Adjust this path if needed

    // Log the status code
    console.log(`Server status: ${response.status}`);

    if (response.status === 200 || response.status === 304) {
      // If the response status is 200 or 304, restore the original src and remove srcdoc
      if (santaIframe.src !== originalSrc) {
        santaIframe.src = originalSrc;
        santaIframe.removeAttribute('srcdoc');
      }
    } else {
      throw new Error('Server not responding');
    }
  } catch (error) {
    // Display custom HTML if the server does not respond
    santaIframe.srcdoc = `
      <html>
        <body style="display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #f2f2f2; font-family: Arial, sans-serif;">
          <div style="text-align: center;">
            <h1 style="color: #333;">We've lost track of Santa Claus!</h1>
            <p style="color: #666;">Please wait while we try to reconnect... (Do not refresh if you want to be reconnected automatically).</p>
          </div>
        </body>
      </html>`;
    console.log("Server check failed:", error.message);
  }
}

setInterval(checkServer, 30000);
checkServer(); // Initial check
