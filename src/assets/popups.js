
    // Function to create and show the popup
    function showPopup() {
        // Create and append styles
        const style = document.createElement('style');
        style.textContent = `
            #popup-container {
                position: absolute;
                background: white;
                padding: 10px;
                border-radius: 8px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                z-index: 9999;
                display: flex; /* Show the popup */
                flex-direction: column; /* Stack items vertically */
                justify-content: center; /* Center items vertically */
                align-items: center; /* Center items horizontally */
                top: 50%; /* Center vertically */
                left: 50%; /* Center horizontally */
                transform: translate(-50%, -50%); /* Adjust for element width and height */
            }

            #popup-content {
                font-family: Arial, sans-serif;
            }

            #close-btn {
                margin-top: 10px;
            }
        `;
        document.head.appendChild(style);

        // Create popup elements
        const popupContainer = document.createElement('div');
        popupContainer.id = 'popup-container';
        
        const popupContent = document.createElement('div');
        popupContent.id = 'popup-content';
        popupContent.textContent = 'This is a popup message!'; // Add your message here

        const closeButton = document.createElement('button');
        closeButton.id = 'close-btn';
        closeButton.textContent = 'Close';

        // Append content to the container
        popupContainer.appendChild(popupContent);
        popupContainer.appendChild(closeButton);
        
        // Append container to the body
        document.body.appendChild(popupContainer);

        // Close popup when button is clicked
        closeButton.addEventListener('click', function() {
            popupContainer.style.display = 'none'; // Hide the popup
            document.body.removeChild(popupContainer); // Remove popup from the DOM
        });
    }

    // Show the popup when the page loads
    window.onload = showPopup;
    function warnuserError(title, body) {
      setTimeout(() => {
        
      const countdownTime = 20; // Countdown time in seconds
    
      // Check if the popup already exists and remove it
      if (document.getElementById('warn-popup')) {
        document.getElementById('warn-popup').remove();
        document.getElementById('warn-overlay').remove();
      }
    
      // Create an overlay to grey out the background
      const overlay = document.createElement('div');
      overlay.id = 'warn-overlay';
      overlay.style.position = 'fixed';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      overlay.style.zIndex = '999';
      overlay.style.transition = 'opacity 0.5s';
      overlay.style.opacity = '0';
    
      // Append overlay to body
      document.body.appendChild(overlay);
    
      // Create popup container
      const popup = document.createElement('div');
      popup.id = 'warn-popup';
      popup.style.position = 'fixed';
      popup.style.top = '10%';
      popup.style.left = '50%';
      popup.style.transform = 'translate(-50%, -100%)';
      popup.style.minWidth = '300px';
      popup.style.padding = '20px';
      popup.style.backgroundColor = '#ff6161';
      popup.style.borderRadius = '8px';
      popup.style.boxShadow = '0 4px 8px rgba(255, 97, 97, 0.2)';
      popup.style.zIndex = '1000';
      popup.style.opacity = '0';
      popup.style.transition = 'opacity 0.5s, transform 0.5s';
    
      // Title element
      const titleElem = document.createElement('h2');
      titleElem.innerText = title;
      titleElem.style.marginTop = '0';
      titleElem.style.fontSize = '18px';
    
      // Body element
      const bodyElem = document.createElement('p');
      bodyElem.innerText = body;
      bodyElem.style.fontSize = '14px';
    
      // Close button with countdown
      const closeButton = document.createElement('button');
      closeButton.innerText = `Close (${countdownTime}s)`;
      closeButton.style.marginTop = '10px';
      closeButton.style.padding = '5px 10px';
      closeButton.style.cursor = 'pointer';
    
      // Function to update countdown
      let timeLeft = countdownTime;
      const countdownInterval = setInterval(() => {
        timeLeft--;
        closeButton.innerText = `Close (${timeLeft}s)`;
        if (timeLeft <= 0) {
          clearInterval(countdownInterval);
          closePopup();
        }
      }, 1000);
    
      // Function to close the popup
      const closePopup = () => {
        popup.style.opacity = '0';
        popup.style.transform = 'translate(-50%, -100%)';
        overlay.style.opacity = '0';
        setTimeout(() => {
          popup.remove();
          overlay.remove();
        }, 500);
      };
    
      closeButton.onclick = closePopup; // Close popup on button click
    
      // Append title, body, and close button to popup
      popup.appendChild(titleElem);
      popup.appendChild(bodyElem);
      popup.appendChild(closeButton);
    
      // Append popup to body
      document.body.appendChild(popup);
    
      // Fade in overlay and popup with a slide animation
      setTimeout(() => {
        overlay.style.opacity = '1';
        popup.style.opacity = '1';
        popup.style.transform = 'translate(-50%, 0)';
      }, 100);
    }, 7000);
    }
    function warnuserWarning(title, body) {
      setTimeout(() => {
        const countdownTime = 20; // Countdown time in seconds
    
        // Check if the warning popup already exists and remove it
        if (document.getElementById('warn-warning-popup')) {
          document.getElementById('warn-warning-popup').remove();
          document.getElementById('warn-warning-overlay').remove();
        }
    
        // Create an overlay to grey out the background
        const overlay = document.createElement('div');
        overlay.id = 'warn-warning-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '999';
        overlay.style.transition = 'opacity 0.5s';
        overlay.style.opacity = '0';
    
        // Append overlay to body
        document.body.appendChild(overlay);
    
        // Create popup container
        const popup = document.createElement('div');
        popup.id = 'warn-warning-popup';
        popup.style.position = 'fixed';
        popup.style.top = '10%';
        popup.style.left = '50%';
        popup.style.transform = 'translate(-50%, -100%)';
        popup.style.minWidth = '300px';
        popup.style.padding = '20px';
        popup.style.backgroundColor = '#ffec99'; // Yellow background
        popup.style.borderRadius = '8px';
        popup.style.boxShadow = '0 4px 8px rgba(255, 236, 153, 0.2)';
        popup.style.zIndex = '1000';
        popup.style.opacity = '0';
        popup.style.transition = 'opacity 0.5s, transform 0.5s';
    
        // Title element
        const titleElem = document.createElement('h2');
        titleElem.innerText = title;
        titleElem.style.marginTop = '0';
        titleElem.style.fontSize = '18px';
    
        // Body element
        const bodyElem = document.createElement('p');
        bodyElem.innerText = body;
        bodyElem.style.fontSize = '14px';
    
        // Close button with countdown
        const closeButton = document.createElement('button');
        closeButton.innerText = `Close (${countdownTime}s)`;
        closeButton.style.marginTop = '10px';
        closeButton.style.padding = '5px 10px';
        closeButton.style.cursor = 'pointer';
    
        // Function to update countdown
        let timeLeft = countdownTime;
        const countdownInterval = setInterval(() => {
          timeLeft--;
          closeButton.innerText = `Close (${timeLeft}s)`;
          if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            closePopup();
          }
        }, 1000);
    
        // Function to close the popup
        const closePopup = () => {
          popup.style.opacity = '0';
          popup.style.transform = 'translate(-50%, -100%)';
          overlay.style.opacity = '0';
          setTimeout(() => {
            popup.remove();
            overlay.remove();
          }, 500);
        };
    
        closeButton.onclick = closePopup; // Close popup on button click
    
        // Append title, body, and close button to popup
        popup.appendChild(titleElem);
        popup.appendChild(bodyElem);
        popup.appendChild(closeButton);
    
        // Append popup to body
        document.body.appendChild(popup);
    
        // Fade in overlay and popup with a slide animation
        setTimeout(() => {
          overlay.style.opacity = '1';
          popup.style.opacity = '1';
          popup.style.transform = 'translate(-50%, 0)';
        }, 100);
      }, 7000);
    }
    