// mapTools.js
import { globalState } from "../../../reactive/state.js";

// Default map styles if none are in state.
const defaultMapStyles = {
  mapHeight: 800,
  mapboxStyle: "mapbox://styles/mapbox/streets-v12"
};

// Ensure that the state has a mapBox property.
if (!globalState.getState().mapBox) {
  globalState.setState({ mapBox: defaultMapStyles });
}

// The initializer for map tools
export function initializeEditTools_mapBox(toolsContainer) {
  console.log("Map tools function called.");

  // Get the current map style settings from state.
  const currentStyles = globalState.getState().mapBox;

  // Define a single group for map settings.
  const groups = [
    {
      groupName: "Map Settings",
      target: currentStyles, // Use the map styles object from state.
      controls: [
        { key: "mapHeight", type: "number", label: "Map Height (px)" },
        { 
          key: "mapboxStyle", 
          type: "select", 
          label: "Map Style", 
          options: [
            { value: "mapbox://styles/mapbox/standard", label: "Mapbox Standard" },
            { value: "mapbox://styles/mapbox/streets-v12", label: "Mapbox Streets" },
            { value: "mapbox://styles/mapbox/outdoors-v12", label: "Mapbox Outdoors" },
            { value: "mapbox://styles/mapbox/light-v11", label: "Mapbox Light" },
            { value: "mapbox://styles/mapbox/dark-v11", label: "Mapbox Dark" },
            { value: "mapbox://styles/mapbox/satellite-v9", label: "Mapbox Satellite" },
            { value: "mapbox://styles/mapbox/satellite-streets-v12", label: "Mapbox Satellite Streets" },
            { value: "mapbox://styles/mapbox/navigation-day-v1", label: "Mapbox Navigation Day" },
            { value: "mapbox://styles/mapbox/navigation-night-v1", label: "Mapbox Navigation Night" }
          ]
        }
      ]
    }
  ];
  
  // For this group, maximum controls is just the number of controls defined.
  const maxControls = groups[0].controls.length;
  
  // Build a table layout.
  const table = document.createElement("table");
  table.style.width = "95%";
  table.style.margin = "0 auto";
  table.style.borderCollapse = "collapse";
  const tbody = document.createElement("tbody");
  
  groups.forEach(group => {
    const row = document.createElement("tr");
    row.style.background = "none";
    
    // First cell: the group name.
    const nameCell = document.createElement("td");
    nameCell.textContent = group.groupName;
    nameCell.style.fontWeight = "bold";
    nameCell.style.padding = "8px";
    row.appendChild(nameCell);
    
    // For each control, add a cell.
    for (let i = 0; i < maxControls; i++) {
      const cell = document.createElement("td");
      cell.style.padding = "8px";
      if (group.controls[i]) {
        const control = group.controls[i];
        const controlDiv = document.createElement("div");
        
        // Create the label.
        const labelElem = document.createElement("div");
        labelElem.textContent = control.label;
        labelElem.style.fontSize = "1em";
        labelElem.style.marginBottom = "4px";
        controlDiv.appendChild(labelElem);
  
        let input;
        if (control.type === "select") {
          input = document.createElement("select");
          control.options.forEach(opt => {
            const option = document.createElement("option");
            option.value = opt.value;
            option.textContent = opt.label;
            input.appendChild(option);
          });
          input.value = group.target[control.key];
        } else if (control.type === "checkbox") {
          input = document.createElement("input");
          input.type = "checkbox";
          input.checked = group.target[control.key];
        } else {
          input = document.createElement("input");
          input.type = control.type; // "number", "color", or "text"
          input.value = group.target[control.key];
          if (control.type === "number") {
            input.style.width = "60px";
          }
        }
  
        input.addEventListener("input", function(e) {
          const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
          group.target[control.key] = value;
          console.log(`Updated ${group.groupName} ${control.key} to ${value}`);
          // Update the state with new map styles.
          const currentMapStyles = globalState.getState().mapBox;
          // Create a new object (or merge) with the updated value.
          const updatedMapStyles = { ...currentMapStyles, [control.key]: value };
          globalState.setState({ mapBox: updatedMapStyles });
          // Call updateMapPreview so that the map re-renders.
          updateMapPreview("mapBox");
        });
  
        controlDiv.appendChild(input);
        cell.appendChild(controlDiv);
      } else {
        cell.textContent = "";
      }
      row.appendChild(cell);
    }
    tbody.appendChild(row);
  });
  
  table.appendChild(tbody);
  toolsContainer.innerHTML = "";
  toolsContainer.appendChild(table);
}

// A minimal update function for map preview.
// In a full implementation, this should be imported from your map module.
export function updateMapPreview(componentId) {
  console.log("updateMapPreview called for", componentId);
  // For example, re-run mapRun with the updated styles.
  // Since componentId is "mapBox", we assume mapRun is imported and can be called:
  // (You might need to pass additional parameters such as a root container.)
  // For this stub, we assume there is a container with id "componentContainer-mapBox".
  const previewContainer = document.getElementById("componentContainer-mapBox");
  if (!previewContainer) {
    console.warn("Preview container for map not found; updateMapPreview aborted.");
    return;
  }
  // Call mapRun with the updated styles from state.
  // Assuming mapRun accepts an object with rootDiv and styles:
  mapRun({ rootDiv: previewContainer, styles: { ...globalState.getState().mapBox } });
}