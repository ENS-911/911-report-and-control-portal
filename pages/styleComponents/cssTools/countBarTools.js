// countBarTools.js
import { globalState } from "../../../reactive/state.js";
import { updatePreview } from "../../editWebsiteStyles.js"; // adjust path as needed

const user = JSON.parse(localStorage.getItem("user"));
const clientKey = user ? user.key : null;

// We'll assume that if no countBar styles are present in state, you want to initialize them with defaults.
const defaultCountBarStyles = {
  container: { padding: "10", backgroundColor: "#222" },
  currentBlock: { fontSize: "16", textColor: "#000", backgroundColor: "#ffcccc", width: "20", borderThickness: "1", borderColor: "#ccc", borderRadius: "5", padding: "10", margin: "5", textAlign: "center" },
  dailyBlock: { fontSize: "16", textColor: "#000", backgroundColor: "#ccffcc", width: "20", borderThickness: "1", borderColor: "#ccc", borderRadius: "5", padding: "10", margin: "5", textAlign: "center" },
  yearlyBlock: { fontSize: "16", textColor: "#000", backgroundColor: "#ccccff", width: "20", borderThickness: "1", borderColor: "#ccc", borderRadius: "5", padding: "10", margin: "5", textAlign: "center" },
  clock: { show: false, hourFormat: "12", fontSize: "16", textColor: "#000", backgroundColor: "#ddd", borderThickness: "1", borderColor: "#ccc", borderRadius: "5", padding: "10", margin: "5", width: "20", textAlign: "center" }
};

// Ensure state is initialized (this is one option; you may already do this in state.js)
if (!globalState.getState().countBarLoaded) {
    const loadedStyles = await loadCountBarStyles(clientKey, defaultCountBarStyles);
    globalState.setState({ countBar: loadedStyles, countBarLoaded: true });
}

// Define the function to build the tools UI.
function initializeEditTools_countBar(toolsContainer) {
  const currentStyles = globalState.getState().countBar;
  
  const groups = [
    {
      groupName: "Container Settings",
      target: currentStyles.container,
      controls: [
        { key: "padding", type: "number", label: "Padding" },
        { key: "backgroundColor", type: "color", label: "BG Color" }
      ]
    },
    {
      groupName: "Current Count Block Settings",
      target: currentStyles.currentBlock,
      controls: [
        { key: "fontSize", type: "number", label: "Font Size" },
        { key: "textColor", type: "color", label: "Text Color" },
        { key: "backgroundColor", type: "color", label: "BG Color" },
        { key: "width", type: "number", label: "Width (%)" },
        { key: "borderThickness", type: "number", label: "Border Thk" },
        { key: "borderColor", type: "color", label: "Border Color" },
        { key: "borderRadius", type: "number", label: "Border Radius" },
        { key: "padding", type: "number", label: "Padding" },
        { key: "margin", type: "number", label: "Margin" }
      ]
    },
    {
      groupName: "Daily Count Block Settings",
      target: currentStyles.dailyBlock,
      controls: [
        { key: "fontSize", type: "number", label: "Font Size" },
        { key: "textColor", type: "color", label: "Text Color" },
        { key: "backgroundColor", type: "color", label: "BG Color" },
        { key: "width", type: "number", label: "Width (%)" },
        { key: "borderThickness", type: "number", label: "Border Thk" },
        { key: "borderColor", type: "color", label: "Border Color" },
        { key: "borderRadius", type: "number", label: "Border Radius" },
        { key: "padding", type: "number", label: "Padding" },
        { key: "margin", type: "number", label: "Margin" }
      ]
    },
    {
      groupName: "Yearly Count Block Settings",
      target: currentStyles.yearlyBlock,
      controls: [
        { key: "fontSize", type: "number", label: "Font Size" },
        { key: "textColor", type: "color", label: "Text Color" },
        { key: "backgroundColor", type: "color", label: "BG Color" },
        { key: "width", type: "number", label: "Width (%)" },
        { key: "borderThickness", type: "number", label: "Border Thk" },
        { key: "borderColor", type: "color", label: "Border Color" },
        { key: "borderRadius", type: "number", label: "Border Radius" },
        { key: "padding", type: "number", label: "Padding" },
        { key: "margin", type: "number", label: "Margin" }
      ]
    },
    {
      groupName: "Clock Settings",
      target: currentStyles.clock,
      controls: [
        { key: "show", type: "checkbox", label: "Show Clock" },
        { key: "hourFormat", type: "select", label: "Hour Format", options: [
            { value: "12", label: "12-hour" },
            { value: "24", label: "24-hour" }
          ]
        },
        { key: "fontSize", type: "number", label: "Font Size" },
        { key: "textColor", type: "color", label: "Text Color" },
        { key: "backgroundColor", type: "color", label: "BG Color" },
        { key: "borderThickness", type: "number", label: "Border Thk" },
        { key: "borderColor", type: "color", label: "Border Color" },
        { key: "borderRadius", type: "number", label: "Border Radius" },
        { key: "padding", type: "number", label: "Padding" },
        { key: "margin", type: "number", label: "Margin" },
        { key: "width", type: "number", label: "Width (%)" }
      ]
    }
  ];
  
  // Determine maximum controls across groups.
  let maxControls = 0;
  groups.forEach(group => {
    if (group.controls.length > maxControls) {
      maxControls = group.controls.length;
    }
  });
  
  // Build a table for the tool UI.
  const table = document.createElement("table");
  table.style.width = "95%";
  table.style.margin = "0 auto";
  table.style.borderCollapse = "collapse";
  
  const tbody = document.createElement("tbody");
  
  groups.forEach(group => {
    const row = document.createElement("tr");
    row.style.background = "none";
    
    // First cell: group name.
    const nameCell = document.createElement("td");
    nameCell.textContent = group.groupName;
    nameCell.style.fontWeight = "bold";
    nameCell.style.padding = "8px";
    row.appendChild(nameCell);
    
    // For each control slot, add a cell.
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
            
            // Determine which state property to update based on the group name.
            let stateKey = "";
            switch (group.groupName) {
                case "Container Settings":
                stateKey = "container";
                break;
                case "Current Count Block Settings":
                stateKey = "currentBlock";
                break;
                case "Daily Count Block Settings":
                stateKey = "dailyBlock";
                break;
                case "Yearly Count Block Settings":
                stateKey = "yearlyBlock";
                break;
                case "Clock Settings":
                stateKey = "clock";
                break;
                default:
                console.error("Unknown group:", group.groupName);
                return;
            }

            const currentCountBar = globalState.getState().countBar;
            const updatedGroup = { ...currentCountBar[stateKey], [control.key]: value };
            globalState.setState({ countBar: { ...currentCountBar, [stateKey]: updatedGroup } });
            console.log(`Updated ${group.groupName} ${control.key} to ${value}`);
            updatePreview("countBar");
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

async function loadCountBarStyles(clientKey, defaultStyles) {
    try {
      const response = await fetch(`https://matrix.911-ens-services.com/client/${clientKey}/countbar_styles`);
      if (response.ok) {
        const savedStyles = await response.json();
        // Merge savedStyles over defaultStyles. This ensures any missing properties get defaults.
        return { ...defaultStyles, ...savedStyles };
      } else {
        console.warn("GET countbar_styles returned non-OK; using defaults.");
        return defaultStyles;
      }
    } catch (error) {
      console.error("Error fetching saved styles:", error);
      return defaultStyles;
    }
}

export { initializeEditTools_countBar };
