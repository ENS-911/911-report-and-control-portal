import { globalState } from "../../../reactive/state.js";
import { mapRun } from "../map.js";

const defaultMapStyles = {
  mapHeight: 800,
  mapboxStyle: "mapbox://styles/mapbox/streets-v12"
};

if (!globalState.getState().mapBox) {
  globalState.setState({ mapBox: defaultMapStyles });
}

export function updateMapPreview(componentId = "mapBox") {
  console.log("updateMapPreview called for", componentId);
  const previewContainer = document.getElementById("componentContainer-mapBox");
  if (!previewContainer) {
    console.warn("Preview container for map not found; updateMapPreview aborted.");
    return;
  }
  // Re-run mapRun with updated styles.
  mapRun({ rootDiv: previewContainer, styles: { ...globalState.getState().mapBox } });
}

export function initializeEditTools_mapBox(toolsContainer) {
  console.log("Map tools function called.");
  const currentStyles = globalState.getState().mapBox;
  
  const groups = [
    {
      groupName: "Map Settings",
      target: currentStyles,
      controls: [
        { key: "mapHeight", type: "number", label: "Map Height (px)" },
        { key: "mapboxStyle", type: "select", label: "Map Style", options: [
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

  const maxControls = groups[0].controls.length;

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
    
    for (let i = 0; i < maxControls; i++) {
      const cell = document.createElement("td");
      cell.style.padding = "8px";
      if (group.controls[i]) {
        const control = group.controls[i];
        const controlDiv = document.createElement("div");
        
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
          input.type = control.type;
          input.value = group.target[control.key];
          if (control.type === "number") {
            input.style.width = "60px";
          }
        }
  
        input.addEventListener("input", function(e) {
          const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
          group.target[control.key] = value;
          console.log(`Updated ${group.groupName} ${control.key} to ${value}`);
          const currentMapStyles = globalState.getState().mapBox;
          const updatedMapStyles = { ...currentMapStyles, [control.key]: value };
          globalState.setState({ mapBox: updatedMapStyles });
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
