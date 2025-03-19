import { globalState } from "../../reactive/state.js";
import { flattenStyles } from "../../forms/formUtils/flattenStyles.js";

/**
 * Renders the Count Bar component.
 * This function fetches saved style data only once (if not already loaded) via the API,
 * then renders the count bar using style data stored in globalState.
 * @param {Object} options - Options for rendering.
 * @param {HTMLElement} options.rootDiv - The container element.
 * @param {Object} [options.styles] - Optional default styles if no saved settings exist.
 */
export async function createCountBar(options) {
  // Retrieve client key from localStorage ("user" object).
  const user = JSON.parse(localStorage.getItem("user"));
  const clientKey = user ? user.key : null;
  console.log("The key from cb0:", clientKey);

  const { rootDiv, styles = {} } = options;

  // Check state; if not loaded, fetch saved styles.
  let state = globalState.getState();
  if (!state.countBarLoaded) {
    try {
      const response = await fetch(`https://matrix.911-ens-services.com/client/${clientKey}/countbar_styles`);
      if (response.ok) {
        const savedStyles = await response.json();
        if (savedStyles && Object.keys(savedStyles).length > 0) {
          console.log("Loaded saved styles:", savedStyles);
          globalState.setState({ countBar: savedStyles });
        } else {
          console.log("No saved styles found; using defaults.");
          globalState.setState({ countBar: styles });
        }
      } else {
        console.warn("GET countbar_styles returned non-OK; using defaults.");
        globalState.setState({ countBar: styles });
      }
    } catch (error) {
      console.error("Error fetching saved styles:", error);
      globalState.setState({ countBar: styles });
    }
    globalState.setState({ countBarLoaded: true });
  }
  
  // Get the current countBar styles from state.
  state = globalState.getState();
  const currentStyles = (state.countBar && Object.keys(state.countBar).length > 0) ? state.countBar : styles;
  console.log("Using countBar styles:", currentStyles);
  const flatStyles = flattenStyles(currentStyles);
  console.log("Flattened countBar styles:", flatStyles);

  // Clear previous content.
  rootDiv.innerHTML = "";

  // Create the main container.
  const container = document.createElement("div");
  container.id = "countBlock";
  container.style.width = "100%";
  container.style.display = "flex";
  container.style.justifyContent = "space-around";
  container.style.alignItems = "center";
  container.style.padding = flatStyles.containerPadding;  // e.g., "10px"
  container.style.backgroundColor = flatStyles.containerBackgroundColor;
  rootDiv.appendChild(container);

  // Create an inner wrapper.
  const countWrap = document.createElement("div");
  countWrap.style.display = "flex";
  countWrap.style.justifyContent = "space-around";
  countWrap.style.width = "100%";
  container.appendChild(countWrap);

  // Helper to create a block section using flattened style keys.
  // We expect flattenStyles to return keys like "currentBlockFontSize", etc.
  function createSection(id, text, prefix, defaultBg) {
    console.log('prefix check: ', prefix)
    const section = document.createElement("div");
    section.id = id;
    section.style.flex = "none";
    section.style.margin = flatStyles[prefix + "Margin"];
    section.style.padding = flatStyles[prefix + "Padding"];
    section.style.borderRadius = flatStyles[prefix + "BorderRadius"];
    section.style.border = flatStyles[prefix + "BorderThickness"] + " solid " + flatStyles[prefix + "BorderColor"];
    section.style.backgroundColor = flatStyles[prefix + "BackgroundColor"] || defaultBg;
    section.style.width = flatStyles[prefix + "Width"];
    
    const textElem = document.createElement("h3");
    textElem.innerText = text;
    textElem.style.fontSize = flatStyles[prefix + "FontSize"];
    textElem.style.color = flatStyles[prefix + "TextColor"];
    textElem.style.textAlign = flatStyles[prefix + "TextAlign"] || "center";
    section.appendChild(textElem);
    return section;
  }

  let currentCount = "";
  let dayCount = "";
  let yearCount = "";

  try {
    const response = await fetch(`https://matrix.911-ens-services.com/count/${clientKey}`);
    const countData = await response.json();
    currentCount = countData.activeCount;
    dayCount = countData.currentDateCount;
    yearCount = countData.totalCount;
  } catch (error) {
    console.error("Error fetching counts:", error.message);
  }

  // Create independent blocks.
  countWrap.appendChild(
      createSection("currentCount", `CURRENT INCIDENTS: ${currentCount}`, "currentBlock", "#ffcccc")
  );
  countWrap.appendChild(
      createSection("dailyCount", `DAILY TOTAL INCIDENTS: ${dayCount}`, "dailyBlock", "#ccffcc")
  );
  countWrap.appendChild(
      createSection("yearlyCount", `YEARLY INCIDENTS: ${yearCount}`, "yearlyBlock", "#ccccff")
  );


  // Optionally, add a live clock.
  if (state.countBar.clock.show) {
    const clockSection = document.createElement("div");
    clockSection.id = "liveClock";
    clockSection.style.flex = "none";
    clockSection.style.margin = flatStyles.clockMargin;
    clockSection.style.padding = flatStyles.clockPadding;
    clockSection.style.borderRadius = flatStyles.clockBorderRadius;
    clockSection.style.border = flatStyles.clockBorderThickness + " solid " + flatStyles.clockBorderColor;
    clockSection.style.backgroundColor = flatStyles.clockBackgroundColor;
    clockSection.style.width = flatStyles.clockWidth;
    
    const clockText = document.createElement("h3");
    clockText.style.fontSize = flatStyles.clockFontSize;
    clockText.style.color = flatStyles.clockTextColor;
    clockSection.appendChild(clockText);
    countWrap.appendChild(clockSection);
    
    function updateClock() {
      const now = new Date();
      const options = { hour: "numeric", minute: "numeric", second: "numeric", hour12: (state.countBar.clock.hourFormat !== "24") };
      clockText.innerText = now.toLocaleTimeString([], options);
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  document.addEventListener('countBarStylesUpdated', (e) => {
    console.log("Tool UI syncing with styles:", e.detail);
    syncToolUI(e.detail);  // Your function to update input values.
  });
}

export function getCurrentStyles() {
  return globalState.getState().countBar;
}