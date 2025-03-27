import { globalState } from "../../../reactive/state.js";

const defaultSortBarStyles = {
  container: {
    backgroundColor: "#ffffff",
    padding: "10",
    margin: "10"
  },
  leftSection: {
    fontSize: "16",
    textColor: "#000000"
  },
  rightSection: {
    fontSize: "16",
    textColor: "#000000"
  },
  dropdown: {
    fontSize: "14",
    textColor: "#000000",
    backgroundColor: "#f0f0f0"
  }
};

// Initialize state if not already present.
if (!globalState.getState().sortBar) {
  globalState.setState({ sortBar: defaultSortBarStyles });
}

/**
 * Initializes the sort bar tools UI.
 * This function creates inputs to adjust the display styles of the sort bar.
 * It does not affect the sorting/filtering logic.
 *
 * @param {HTMLElement} toolsContainer - The container in which to build the tools UI.
 */
export function initializeEditTools_sortBar(toolsContainer) {
  console.log("initializeEditTools_sortBar called.");

  const currentStyles = globalState.getState().sortBar;

  const groups = [
    {
      groupName: "Sort Bar Container",
      target: currentStyles.container,
      controls: [
        { key: "backgroundColor", type: "color", label: "BG Color" },
        { key: "padding", type: "number", label: "Padding (px)" },
        { key: "margin", type: "number", label: "Margin (px)" }
      ]
    },
    {
      groupName: "Left Section",
      target: currentStyles.leftSection,
      controls: [
        { key: "fontSize", type: "number", label: "Font Size (px)" },
        { key: "textColor", type: "color", label: "Text Color" }
      ]
    },
    {
      groupName: "Right Section",
      target: currentStyles.rightSection,
      controls: [
        { key: "fontSize", type: "number", label: "Font Size (px)" },
        { key: "textColor", type: "color", label: "Text Color" }
      ]
    },
    {
      groupName: "Dropdown Style",
      target: currentStyles.dropdown,
      controls: [
        { key: "fontSize", type: "number", label: "Font Size (px)" },
        { key: "textColor", type: "color", label: "Text Color" },
        { key: "backgroundColor", type: "color", label: "BG Color" }
      ]
    }
  ];

  let maxControls = 0;
  groups.forEach(group => {
    if (group.controls.length > maxControls) {
      maxControls = group.controls.length;
    }
  });

  const table = document.createElement("table");
  table.style.width = "95%";
  table.style.margin = "0 auto";
  table.style.borderCollapse = "collapse";
  const tbody = document.createElement("tbody");

  groups.forEach(group => {
    const row = document.createElement("tr");
    row.style.background = "none";

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
          const currentSortBar = globalState.getState().sortBar;
          let stateKey;
          switch (group.groupName) {
            case "Sort Bar Container": stateKey = "container"; break;
            case "Left Section": stateKey = "leftSection"; break;
            case "Right Section": stateKey = "rightSection"; break;
            case "Dropdown Style": stateKey = "dropdown"; break;
            default: stateKey = "";
          }
          if (stateKey) {
            const updatedGroup = { ...currentSortBar[stateKey], [control.key]: value };
            globalState.setState({ sortBar: { ...currentSortBar, [stateKey]: updatedGroup } });
          }
          updateSortBar();
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

export function updateSortBar() {
  console.log("Sort bar updated with new styles:", globalState.getState().sortBar);
}
