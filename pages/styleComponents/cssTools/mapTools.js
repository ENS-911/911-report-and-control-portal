//import { updatePreview } from '../../../pages/editWebsiteStyles.js'

console.log("mapTools.js loaded");

window.mapStyles = window.mapStyles || {
    mapHeight: 800,
    mapboxStyle: "mapbox://styles/mapbox/streets-v12"
};
  
window.initializeEditTools_mapBox = function(toolsContainer) {
    const groups = [
      {
        groupName: "Map Settings",
        target: window.mapStyles,
        controls: [
          { key: "mapHeight", type: "number", label: "Map Height (px)" },
          { key: "mapboxStyle", type: "select", label: "Map Style", options: [
              { value: "mapbox://styles/mapbox/standard", label: "Mapbox Standard" },
              { value: "mapbox://styles/mapbox/streets-v12", label: "Mapbox Streets" },
              { value: "mapbox://styles/mapbox/outdoors-v12", label: "Mapbox Outdoors" },
              { value: "mapbox://styles/mapbox/light-v11", label: "Mapbox Light" },
              { value: "mapbox://styles/mapbox/dark-v11", label: "Mapbox Dark" },
              { value: "mapbox://styles/mapbox/satellite-v9", label: "Mapbox Satellite" },
              { value: "mapbox://styles/mapbox/satellite-streets-v12", label: "Mapbox Satellite Streets" }
            ]
          }
        ]
      }
    ];
    
    // Determine maximum controls (in this case, it's 2)
    let maxControls = groups[0].controls.length;
    
    // Build a table layout.
    const table = document.createElement("table");
    table.style.width = "95%";
    table.style.margin = "0 auto";
    table.style.borderCollapse = "collapse";
    
    const tbody = document.createElement("tbody");
    
    groups.forEach(group => {
      const row = document.createElement("tr");
      row.style.background = "none";
      
      // Group name cell.
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
          
          // Label above input.
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
          } else {
            input = document.createElement("input");
            input.type = control.type;
            input.value = group.target[control.key];
            if (control.type === "number") {
              input.style.width = "60px";
            }
          }
    
          input.addEventListener("input", function(e) {
            const value = (e.target.type === "checkbox") ? e.target.checked : e.target.value;
            group.target[control.key] = value;
            // Trigger a map update (ensure updateMapPreview() is defined in map.js)
            if (typeof updateMapPreview === "function") {
              updateMapPreview("mapBox");
            }
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
  };
  
  function syncToolUI(styles) {
    console.log("Syncing tool UI with styles", styles);
    updateMapPreview("mapBox");
}
  
window.addEventListener('mapBoxStylesUpdated', (e) => {
    // e.detail contains the current style settings from the component
    syncToolUI(e.detail); // Replace with your tool UI update function
}, { once: true });

function updateMapPreview() {
    if (!window.map) {
      console.warn("Map instance not available, retrying updateMapPreview in 200ms.");
      setTimeout(updateMapPreview, 200);
      return;
    }
    
    // Update the map container height if available.
    const mapArea = document.getElementById("map");
    if (mapArea && window.mapStyles && window.mapStyles.mapHeight) {
      mapArea.style.height = window.mapStyles.mapHeight + "px";
    }
    
    // Update the map style using the global mapStyles.
    const newStyle = (window.mapStyles && window.mapStyles.mapboxStyle) || "mapbox://styles/mapbox/streets-v12";
    window.map.setStyle(newStyle);
}  
  
// Attach updateMapPreview to window so it’s globally available.
window.updateMapPreview = updateMapPreview;

window.initializeEditTools_mapBox = initializeEditTools_mapBox;