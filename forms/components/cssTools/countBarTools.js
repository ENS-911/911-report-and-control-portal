/* File: countBarTools.js */

// If saved settings exist from the database, assign them to window.countBarStyles before this file loads.
// Otherwise, assign the default settings.
if (!window.countBarStyles) {
    window.countBarStyles = {
      container: {
        padding: "10",
        backgroundColor: "#222"
      },
      currentBlock: {
        fontSize: "16",
        textColor: "#000",
        backgroundColor: "#ffcccc",
        width: "20",
        borderThickness: "1",
        borderColor: "#ccc",
        borderRadius: "5",
        padding: "10",
        margin: "5"
      },
      dailyBlock: {
        fontSize: "16",
        textColor: "#000",
        backgroundColor: "#ccffcc",
        width: "20",
        borderThickness: "1",
        borderColor: "#ccc",
        borderRadius: "5",
        padding: "10",
        margin: "5"
      },
      yearlyBlock: {
        fontSize: "16",
        textColor: "#000",
        backgroundColor: "#ccccff",
        width: "20",
        borderThickness: "1",
        borderColor: "#ccc",
        borderRadius: "5",
        padding: "10",
        margin: "5"
      },
      clock: {
        show: false,
        hourFormat: "12",
        fontSize: "16",
        textColor: "#000",
        backgroundColor: "#ddd",
        borderThickness: "1",
        borderColor: "#ccc",
        borderRadius: "5",
        padding: "10",
        margin: "5",
        width: "20"
      }
    };
}
  
window.initializeEditTools = function(toolsContainer) {
    // --- Define Tool Groups ---
    // Each group corresponds to one row in our table.
    const groups = [
      {
        groupName: "Container Settings",
        target: window.countBarStyles.container,
        controls: [
          { key: "padding", type: "number", label: "Padding" },
          { key: "backgroundColor", type: "color", label: "BG Color" }
        ]
      },
      {
        groupName: "Current Count Block Settings",
        target: window.countBarStyles.currentBlock,
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
        target: window.countBarStyles.dailyBlock,
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
        target: window.countBarStyles.yearlyBlock,
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
        target: window.countBarStyles.clock,
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
  
    // Determine the maximum number of controls among groups.
    let maxControls = 0;
    groups.forEach(group => {
      if (group.controls.length > maxControls) {
        maxControls = group.controls.length;
      }
    });
  
    // --- Build the Table Layout (No Header Row, No Row Colors) ---
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
          const label = document.createElement("div");
          label.textContent = control.label;
          label.style.fontSize = "1em";
          label.style.marginBottom = "4px";
          controlDiv.appendChild(label);
  
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
            input.type = control.type; // "number" or "color"
            input.value = group.target[control.key];
            if (control.type === "number") {
              input.style.width = "60px";
            }
          }
          input.addEventListener("input", function(e) {
            const value = (e.target.type === "checkbox") ? e.target.checked : e.target.value;
            group.target[control.key] = value;
            updatePreview();
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
  
    // --- Update Preview: Apply CSS Changes Immediately ---
    function updatePreview() {
        const container = document.getElementById("countBlock");
        if (!container) {
          console.warn("countBlock not found. Retrying in 200ms.");
          setTimeout(updatePreview, 200);
          return;
        }
        
        // Now that countBlock exists, continue with updates.
        container.style.padding = window.countBarStyles.container.padding + "px";
        container.style.backgroundColor = window.countBarStyles.container.backgroundColor;
        
        // Update each block. (Same as before.)
        function updateBlock(elementId, settings) {
          const elem = document.getElementById(elementId);
          if (elem) {
            elem.style.flex = "none"; 
            elem.style.margin = settings.margin + "px";
            elem.style.padding = settings.padding + "px";
            elem.style.backgroundColor = settings.backgroundColor;
            elem.style.border = settings.borderThickness + "px solid " + settings.borderColor;
            elem.style.borderRadius = settings.borderRadius + "px";
            elem.style.width = settings.width + "%";
            const h3 = elem.querySelector("h3");
            if (h3) {
              h3.style.fontSize = settings.fontSize + "px";
              h3.style.color = settings.textColor;
            }
          } else {
            console.warn(elementId + " not found.");
          }
        }
        
        updateBlock("currentCount", window.countBarStyles.currentBlock);
        updateBlock("dailyCount", window.countBarStyles.dailyBlock);
        updateBlock("yearlyCount", window.countBarStyles.yearlyBlock);
        
        // Update clock styles.
        const clockElem = document.getElementById("liveClock");
        if (clockElem) {
          clockElem.style.display = window.countBarStyles.clock.show ? "flex" : "none";
          clockElem.style.margin = window.countBarStyles.clock.margin + "px";
          clockElem.style.padding = window.countBarStyles.clock.padding + "px";
          clockElem.style.backgroundColor = window.countBarStyles.clock.backgroundColor;
          clockElem.style.border = window.countBarStyles.clock.borderThickness + "px solid " + window.countBarStyles.clock.borderColor;
          clockElem.style.borderRadius = window.countBarStyles.clock.borderRadius + "px";
          clockElem.style.width = window.countBarStyles.clock.width + "%";
          const h3 = clockElem.querySelector("h3");
          if (h3) {
            h3.style.fontSize = window.countBarStyles.clock.fontSize + "px";
            h3.style.color = window.countBarStyles.clock.textColor;
          }
        }
      }           
  
    // --- Initial Update ---
    updatePreview();
};
  