/**
 * Renders the Count Bar component.
 * This function now handles fetching its own style data.
 * @param {Object} options - Options for rendering.
 * @param {HTMLElement} options.rootDiv - The container element.
 * @param {Object} [options.styles] - Optional default styles if no saved settings exist.
 */

async function createCountBar(options) {
    const clientKey = window.clientID;
    console.log('the key from cb0: ', clientKey)
    const { rootDiv, styles = {} } = options;
    
    if (!window.countBarStylesLoaded) {
      try {
        const response = await fetch(`https://matrix.911-ens-services.com/client/${clientKey}/countbar_styles`);
        if (response.ok) {
          const savedStyles = await response.json();
          if (savedStyles) {
            console.log("Loaded saved styles:", savedStyles);
            window.countBarStyles = savedStyles;
          } else {
            console.log("No saved styles found; using provided defaults.");
            window.countBarStyles = styles;
          }
        } else {
          console.warn("GET countbar_styles returned non-OK status; using defaults.");
          window.countBarStyles = styles;
        }
      } catch (error) {
        console.error("Error fetching saved styles:", error);
        window.countBarStyles = styles;
      }
      window.countBarStylesLoaded = true;
    }  
  
    rootDiv.innerHTML = "";
    
    const container = document.createElement("div");
    container.id = "countBlock";
    container.style.width = "100%";
    container.style.display = "flex";
    container.style.justifyContent = "space-around";
    container.style.alignItems = "center";
    container.style.padding = window.countBarStyles.container.padding + "px";
    container.style.backgroundColor = window.countBarStyles.container.backgroundColor;
    rootDiv.appendChild(container);
    
    // Create an inner wrapper.
    const countWrap = document.createElement("div");
    countWrap.style.display = "flex";
    countWrap.style.justifyContent = "space-around";
    countWrap.style.width = "100%";
    container.appendChild(countWrap);
    
    // Helper to create a block section.
    function createSection(id, text, blockStyles, defaultBg) {
      const section = document.createElement("div");
      section.id = id;
      section.style.flex = "none";
      section.style.margin = blockStyles.margin + "px";
      section.style.padding = blockStyles.padding + "px";
      section.style.borderRadius = blockStyles.borderRadius + "px";
      section.style.border = blockStyles.borderThickness + "px solid " + blockStyles.borderColor;
      section.style.backgroundColor = blockStyles.backgroundColor || defaultBg;
      section.style.width = blockStyles.width + "%";
      
      const textElem = document.createElement("h3");
      textElem.innerText = text;
      textElem.style.fontSize = blockStyles.fontSize + "px";
      textElem.style.color = blockStyles.textColor;
      textElem.style.textAlign = blockStyles.textAlign || "center";
      section.appendChild(textElem);
      return section;
    }
  
    let currentCount = "";
    let dayCount = "";
    let yearCount = "";
  
    try {
      const response = await fetch(`https://matrix.911-ens-services.com/count/${clientID}`);
      const countData = await response.json();
      currentCount = countData.activeCount;
      dayCount = countData.currentDateCount;
      yearCount = countData.totalCount;
    } catch (error) {
        console.error('Error fetching counts:', error.message);
    }
    
    // Create independent blocks using the component's own style data.
    countWrap.appendChild(
      createSection("currentCount", `CURRENT INCIDENTS: ${currentCount}`, window.countBarStyles.currentBlock, "#ffcccc")
    );
    countWrap.appendChild(
      createSection("dailyCount", `DAILY TOTAL INCIDENTS: ${dayCount}`, window.countBarStyles.dailyBlock, "#ccffcc")
    );
    countWrap.appendChild(
      createSection("yearlyCount", `YEARLY INCIDENTS: ${yearCount}`, window.countBarStyles.yearlyBlock, "#ccccff")
    );
    
    // Optionally, add a live clock.
    if (window.countBarStyles.clock.show) {
      const clockSection = document.createElement("div");
      clockSection.id = "liveClock";
      clockSection.style.flex = "none";
      clockSection.style.margin = window.countBarStyles.clock.margin + "px";
      clockSection.style.padding = window.countBarStyles.clock.padding + "px";
      clockSection.style.borderRadius = window.countBarStyles.clock.borderRadius + "px";
      clockSection.style.border = window.countBarStyles.clock.borderThickness + "px solid " + window.countBarStyles.clock.borderColor;
      clockSection.style.backgroundColor = window.countBarStyles.clock.backgroundColor;
      clockSection.style.width = window.countBarStyles.clock.width + "%";
    
      const clockText = document.createElement("h3");
      clockText.style.fontSize = window.countBarStyles.clock.fontSize + "px";
      clockText.style.color = window.countBarStyles.clock.textColor;
      clockSection.appendChild(clockText);
      countWrap.appendChild(clockSection);
    
      function updateClock() {
        const now = new Date();
        const options = { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: (window.countBarStyles.clock.hourFormat !== "24") };
        clockText.innerText = now.toLocaleTimeString([], options);
      }
      updateClock();
      setInterval(updateClock, 1000);
    }
  
    window.dispatchEvent(new CustomEvent('countBarStylesUpdated', {
      detail: window.countBarStyles
    }));
  }
  
  /**
   * Getter to expose the component's current style settings.
   * This allows the control panel to sync its tool UI.
   * @returns {Object} The current style settings.
   */
  function getCurrentStyles() {
    return window.countBarStyles;
  }
  
  // If using a module system, export the functions. Otherwise attach to window.
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { createCountBar, getCurrentStyles };
  } else {
    window.ENSComponent_countBar = createCountBar;
    window.getCurrentStyles_countBar = getCurrentStyles;
  }
  
  export { createCountBar };