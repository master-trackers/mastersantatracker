function toggleSettings(){var e=document.getElementById("settingsPopup");"block"===e.style.display?e.style.display="none":e.style.display="block"}function openDonationScreen(){var e=document.createElement("iframe"),t=(e.src="/donationiframe",e.style.position="fixed",e.style.top="50%",e.style.left="50%",e.style.transform="translate(-50%, -50%)",e.style.width="90vw",e.style.height="90vh",e.style.border="none",e.style.zIndex="9999",document.createElement("button"));t.textContent="x",t.style.position="absolute",t.style.top="100px",t.style.right="10px",t.style.padding="5px",t.style.background="rgba(0, 0, 0, 0.5)",t.style.color="#fff",t.style.border="none",t.style.borderRadius="50%",t.style.cursor="pointer",t.style.zIndex="10000",t.onclick=function(){document.body.removeChild(e),document.body.removeChild(t)},document.body.appendChild(e),document.body.appendChild(t)}function handleSSE(e){!0===(e=JSON.parse(e.data)).unlocked&&(window.location.href="/"),!0===e.refresh&&(window.location.href="/")}function startSSE(){new EventSource("/updates").onmessage=handleSSE}let ipapiUrl="https://ipapi.co/json/";async function fetchIpAndSendHit(){try{var e=await fetch(ipapiUrl);if(!e.ok)throw new Error("Failed to fetch IP information");var t=await e.json(),o=t.ip,n=t.country_code;if(console.log(`IP: ${o}, Country: `+n),!(await fetch("/hit/4?country="+n)).ok)throw new Error("Failed to send hit");console.log("Hit sent successfully")}catch(e){console.error("Error:",e)}}fetchIpAndSendHit();