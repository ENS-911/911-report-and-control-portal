import { flattenStyles } from "../forms/formUtils/flattenStyles.js";
import { globalState } from "../reactive/state.js"; // state management module
import { createCountBar } from "../pages/styleComponents/cb0.js";
import { initializeEditTools_countBar } from "../pages/styleComponents/cssTools/countBarTools.js";
import { mapRun } from "../pages/styleComponents/map.js";
import { initializeEditTools_mapBox } from "../pages/styleComponents/cssTools/mapTools.js";
import { createSortBar } from "../pages/styleComponents/sb0.js";
import { initializeEditTools_sortBar } from "../pages/styleComponents/cssTools/sbTools.js";

const user = JSON.parse(localStorage.getItem('user'));
const clientKey = user ? user.key : null;

const availableComponents = [
  { 
    id: "countBar", 
    name: "Count Bars", 
    component: createCountBar,
    tools: initializeEditTools_countBar,
    componentContainerId: "componentContainer-countBar",  
    toolsContainerId: "toolsContainer-countBar"
  },
  { 
    id: "mapBox", 
    name: "Map", 
    component: mapRun,
    tools: initializeEditTools_mapBox,
    componentContainerId: "componentContainer-mapBox",  
    toolsContainerId: "toolsContainer-mapBox"
  },
  { 
    id: "sortBar",
    name: "Sort Bar",
    component: createSortBar,
    tools: initializeEditTools_sortBar,
    componentContainerId: "componentContainer-sortBar",
    toolsContainerId: "toolsContainer-sortBar"
  }
];

function loadPage() {
  const setStage = document.getElementById('contentBody');
  if (!setStage) {
    console.error("contentBody container not found.");
    return;
  }
  
  availableComponents.forEach(component => {
    const section = document.createElement("div");
    section.id = `section-${component.id}`;
    section.classList.add("component-section");
    section.style.width = "100%";
    section.style.marginTop = "15px";

    const title = document.createElement("h2");
    title.innerText = component.name;
    title.style.width = "100%";
    title.style.backgroundColor = "#d3d3d3";
    title.style.padding = "8px 0";
    title.style.textAlign = "center";
    section.appendChild(title);

    const compContainer = document.createElement("div");
    compContainer.id = component.componentContainerId;
    compContainer.classList.add("component-container");
    compContainer.style.width = "100%";
    compContainer.style.padding = "20px";
    compContainer.style.backgroundColor = "#ffffff";
    section.appendChild(compContainer);

    const toolsContainer = document.createElement("div");
    toolsContainer.id = component.toolsContainerId;
    toolsContainer.classList.add("tools-container");
    toolsContainer.style.marginTop = "10px";
    section.appendChild(toolsContainer);

    setStage.appendChild(section);

    let styles = {};
    if (component.id === "countBar") {
      styles = flattenStyles(globalState.getState().countBar);
    } else if (component.id === "mapBox") {
      styles = { ...globalState.getState().mapBox };
    }

    component.component({ rootDiv: compContainer, styles });

    component.tools(toolsContainer);
  });

  addSaveButtonWhenReady();
  addMapSaveButtonWhenReady()
}

function addSaveButtonWhenReady() {
  const previewContainer = document.getElementById("componentContainer-countBar");
  if (!previewContainer) {
    console.error("Preview container not found");
    return;
  }
  
  const observer = new MutationObserver((mutations, obs) => {
    if (document.getElementById("countBlock")) {
      console.log("Found countBlock; adding Save button");
      addSaveButton();
      obs.disconnect();
    }
  });
  observer.observe(previewContainer, { childList: true, subtree: true });
}

function addSaveButton() {
  const toolsContainer = document.getElementById("toolsContainer-countBar");
  if (!toolsContainer) {
    console.error("Tools container for countBar not found.");
    return;
  }
  if (document.getElementById("saveStylesBtn")) return;
  
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
      body: JSON.stringify(globalState.getState().countBar)
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
  
  toolsContainer.appendChild(saveBtn);
}

function addMapSaveButtonWhenReady() {
  const previewContainer = document.getElementById("componentContainer-mapBox");
  if (!previewContainer) {
    console.error("Map preview container not found");
    return;
  }

  const observer = new MutationObserver((mutations, obs) => {
    if (document.getElementById("map")) {
      console.log("Map found; adding Save Map Styles button");
      addMapSaveButton();
      obs.disconnect();
    }
  });
  
  observer.observe(previewContainer, { childList: true, subtree: true });
}

function addMapSaveButton() {
  const toolsContainer = document.getElementById("toolsContainer-mapBox");
  if (!toolsContainer) {
    console.error("Map tools container not found");
    return;
  }

  if (document.getElementById("saveMapStylesBtn")) return;

  const saveBtn = document.createElement("button");
  saveBtn.id = "saveMapStylesBtn";
  saveBtn.innerText = "Save Map Styles";
  saveBtn.style.padding = "10px 20px";
  saveBtn.style.marginTop = "10px";
  saveBtn.style.cursor = "pointer";

  saveBtn.addEventListener("click", () => {
    const currentMapStyles = globalState.getState().mapBox;
    fetch(`https://matrix.911-ens-services.com/client/${clientKey}/map_styles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentMapStyles)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to save map styles, status: " + response.status);
        }
        return response.json();
      })
      .then(data => {
        console.log("Map styles saved successfully:", data);
        alert("Map styles saved successfully.");
      })
      .catch(error => {
        console.error("Error saving map styles:", error);
        alert("Error saving map styles. Please try again.");
      });
  });
  
  toolsContainer.appendChild(saveBtn);
}

function updatePreview(componentId) {
  console.log("updatePreview called for:", componentId);
  const containerId = `componentContainer-${componentId}`;
  const previewContainer = document.getElementById(containerId);
  if (!previewContainer) {
    console.warn(`Preview container not found for ${componentId}; updatePreview aborted.`);
    return;
  }
  
  if (componentId === "countBar") {
    const currentStyles = globalState.getState().countBar;
    const flatStyles = flattenStyles(currentStyles);
    createCountBar({ rootDiv: previewContainer, styles: flatStyles });
  } else if (componentId === "mapBox") {
    const currentStyles = { ...globalState.getState().mapBox };
    mapRun({ rootDiv: previewContainer, styles: currentStyles });
  } else {
    console.error(`No update logic for component: ${componentId}`);
  }
}

export { loadPage, updatePreview };
