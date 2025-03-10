const clientKey = window.clientID

const availableComponents = [
    { 
      id: "countBar", 
      name: "Count Bars", 
      script: "count-bars/cb0.js", 
      globalComponent: "ENSComponent_countBar", 
      globalTools: "initializeEditTools_countBar",
      toolsScript: "countBarTools.js",
      componentContainerId: "componentContainer-countBar",  
      toolsContainerId: "toolsContainer-countBar"
    },
    { 
      id: "mapBox", 
      name: "Map", 
      script: "map/map.js", 
      globalComponent: "ENSComponent_mapBox", 
      globalTools: "initializeEditTools_mapBox",
      toolsScript: "mapTools.js",
      componentContainerId: "componentContainer-mapBox",  
      toolsContainerId: "toolsContainer-mapBox"
    }
  ];

export function loadPage() {
    const setStage = document.getElementById('contentBody');
    
    availableComponents.forEach((component) => {
        // Create a section container for the component
        const section = document.createElement("div");
        section.id = `section-${component.id}`;
        section.classList.add("component-section");
        section.style.width = "100%";
        section.style.marginTop = "15px";

        // Section Title (Component name)
        const title = document.createElement("h2");
        title.innerText = component.name;
        title.style.width = "100%";
        title.style.backgroundColor = "#d3d3d3";
        title.style.padding = "8px 0";
        title.style.textAlign = "center";
        section.appendChild(title);

        // Preview Container (where the component will render)
        const componentContainer = document.createElement("div");
        componentContainer.id = `componentContainer-${component.id}`;
        componentContainer.classList.add("component-container");
        componentContainer.style.width = "100%";
        componentContainer.style.padding = "20px";
        componentContainer.style.backgroundColor = "#ffffff"; 
        section.appendChild(componentContainer);

        // Edit Tools Container (for adjustments)
        const toolsContainer = document.createElement("div");
        toolsContainer.id = `toolsContainer-${component.id}`;
        toolsContainer.classList.add("tools-container");
        toolsContainer.style.marginTop = "10px";
        section.appendChild(toolsContainer);

        // Append the component section to the control panel stage
        setStage.appendChild(section);

        // Dynamically load the component (its preview)
        loadComponent(
            `https://ensloadout.911emergensee.com/ens-packages/components/${component.script}`,
            componentContainer.id,
            component.globalComponent
        );

        loadEditTools(component.toolsScript, toolsContainer.id, component.globalTools);
    });
    addSaveButtonWhenReady();
}

function loadComponent(scriptUrl, containerId, globalName) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = scriptUrl;
      script.type = "text/javascript";
      script.async = true;
      script.onload = () => {
        if (typeof window[globalName] === "function") {
          const rootDiv = document.getElementById(containerId);
          if (!rootDiv) return reject(`Container ${containerId} not found`);
          const flatStyles = flattenStyles(window.countBarStyles);
          window[globalName]({ rootDiv, styles: flatStyles });
          resolve();
        } else {
            reject(`${globalComponentName} not found after script load`);
        }
      };
  
      script.onerror = () => reject("Failed to load script");
      document.body.appendChild(script);
    });
}

function loadEditTools(toolsScript, containerId, globalToolsName) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `./forms/components/cssTools/${toolsScript}`;
      script.type = "text/javascript";  // classic script (not a module)
      script.async = true;
      script.onload = () => {
        if (window[globalToolsName]) {
          const toolsDiv = document.getElementById(containerId);
          if (!toolsDiv) return reject("Tools container not found");
          window[globalToolsName](toolsDiv);
          resolve();
        } else {
          reject("Edit tools function not found after script load");
        }
      };
      script.onerror = () => reject("Failed to load edit tools script: " + toolsScript);
      document.body.appendChild(script);
    });
}

function addSaveButtonWhenReady() {
    // Select the container where the remote component is loaded.
    const previewContainer = document.getElementById("componentContainer-countBar");
    if (!previewContainer) {
      console.error("Preview container not found");
      return;
    }
  
    // Create a MutationObserver to watch for when "countBlock" is added.
    const observer = new MutationObserver((mutations, obs) => {
      // Check if an element with id "countBlock" exists.
      const countBlock = document.getElementById("countBlock");
      if (countBlock) {
        console.log("Found countBlock; adding Save button");
        // Once the component is loaded, add the Save button.
        addSaveButton();
        // Stop observing.
        obs.disconnect();
      }
    });
  
    // Start observing the preview container for child list changes.
    observer.observe(previewContainer, { childList: true, subtree: true });
  }
  
  function addSaveButton() {
    const toolsContainer = document.getElementById("toolsContainer-countBar");
    if (!toolsContainer) {
        console.error("Tools container for countBar not found.");
        return;
    }
    // Check if the button is already present.
    if (document.getElementById("saveStylesBtn")) {
        return; // Button already exists—do not add another.
    }

    const saveBtn = document.createElement("button");
    saveBtn.id = "saveStylesBtn";
    saveBtn.innerText = "Save Styles";
    saveBtn.style.padding = "10px 20px";
    saveBtn.style.marginTop = "10px";
    saveBtn.style.cursor = "pointer";
    
    saveBtn.addEventListener("click", () => {
      fetch(`https://matrix.911-ens-services.com/client/${clientKey}/countbar_styles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(window.countBarStyles)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error("Failed to save styles, status: " + response.status);
          }
          return response.json();
        })
        .then(data => {
          console.log("Styles saved successfully:", data);
          alert("Styles saved successfully.");
        })
        .catch(error => {
          console.error("Error saving styles:", error);
          alert("Error saving styles. Please try again.");
        });
    });
    
    if (toolsContainer) {
      toolsContainer.appendChild(saveBtn);
    } else {
      console.error("Tools container for countBar not found.");
    }
}

export function updatePreview(componentId) {
    console.log('component id passed: ', componentId)
    // Determine the preview container based on the component's container ID.
    const containerId = `componentContainer-${componentId}`;
    const previewContainer = document.getElementById(containerId);
    if (!previewContainer) {
      console.warn(`Preview container not found for ${componentId}; updatePreview aborted.`);
      return;
    }
    
    // Choose the global style object based on componentId.
    let globalStyles;
    let initializer;
    
    switch (componentId) {
      case "countBar":
        globalStyles = window.countBarStyles;
        initializer = window.ENSComponent_countBar;
        break;
      case "mapBox":
        globalStyles = window.mapStyles;
        initializer = window.ENSComponent_mapBox;
        break;
      // Add cases for additional components as needed.
      default:
        console.error(`No global styles or initializer defined for componentId: ${componentId}`);
        return;
    }
    
    // Ensure the flattenStyles function is available.
    if (typeof flattenStyles !== "function") {
      console.error("flattenStyles is not defined.");
      return;
    }
    
    // Flatten the styles.
    const flatStyles = flattenStyles(globalStyles);
    console.log(`Applying flattened styles for ${componentId}:`, flatStyles);
    
    // Check that the initializer function exists and re-render the component.
    if (typeof initializer === "function") {
      initializer({ rootDiv: previewContainer, styles: flatStyles });
    } else {
      console.error(`Component initializer is not defined for ${componentId}.`);
    }
}
  

window.addEventListener('countBarStylesUpdated', (e) => {
    console.log("Component styles updated:", e.detail);
    const toolsContainer = document.getElementById("toolsContainer-countBar");
    if (toolsContainer && typeof window.initializeEditTools === "function") {
      // Rebuild the tool UI so its input values reflect the updated styles.
      window.initializeEditTools(toolsContainer);
      addSaveButton();
    }
});

window.updatePreview = updatePreview