
console.log("Global Client ID set:", window.clientID);
// Elevate `mainData.key` to global scope



export function loadPage() {
    const setStage = document.getElementById('contentBody');
    setStage.innerHTML = `
      <h1>Style Editing Page</h1>
      <div id="componentContainer"><p>Loading component...</p></div>
    `;
}

function loadComponent(scriptUrl, containerId) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = scriptUrl;
      script.type = "text/javascript"; // Ensure it's a normal script
      script.async = true;
  
      script.onload = () => {
        if (window.ENSComponent) {
          const rootDiv = document.getElementById(containerId);
          if (!rootDiv) return reject("Container not found");
  
          window.ENSComponent({ rootDiv }) // Call createCountBar with a rootDiv
            .then(() => resolve())
            .catch(reject);
        } else {
          reject("ENSComponent not found after script load");
        }
      };
  
      script.onerror = () => reject("Failed to load script");
      document.body.appendChild(script);
    });
}
  
  // Load cb0.js when the page loads
loadComponent(
    "https://ensloadout.911emergensee.com/ens-packages/components/count-bars/cb0.js",
    "componentContainer"
)
.then(() => console.log("Component loaded successfully"))
.catch((error) => console.error("Error loading component:", error));  
  