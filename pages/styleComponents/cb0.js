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
        if (savedStyles) {
          console.log("Loaded saved styles:", savedStyles);
          globalState.setState({ countBar: savedStyles });
        } else {
          console.log("No saved styles found; using provided defaults.");
          globalState.setState({ countBar: styles });
        }
      } else {
        console.warn("GET countbar_styles returned non-OK status; using defaults.");
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
  const currentStyles = state.countBar || styles;

  // Clear previous content.
  rootDiv.innerHTML = "";

  // Create the main container.
  const container = document.createElement("div");
  container.id = "countBlock";
  container.style.width = "100%";
  container.style.display = "flex";
  container.style.justifyContent = "space-around";
  container.style.alignItems = "center";
  container.style.padding = currentStyles.container.padding + "px";
  container.style.backgroundColor = currentStyles.container.backgroundColor;
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
    const response = await fetch(`https://matrix.911emergensee.com/count/${clientKey}`);
    const countData = await response.json();
    currentCount = countData.activeCount;
    dayCount = countData.currentDateCount;
    yearCount = countData.totalCount;
  } catch (error) {
    console.error("Error fetching counts:", error.message);
  }

  // Create independent blocks.
  countWrap.appendChild(
    createSection("currentCount", `CURRENT INCIDENTS: ${currentCount}`, currentStyles.currentBlock, "#ffcccc")
  );
  countWrap.appendChild(
    createSection("dailyCount", `DAILY TOTAL INCIDENTS: ${dayCount}`, currentStyles.dailyBlock, "#ccffcc")
  );
  countWrap.appendChild(
    createSection("yearlyCount", `YEARLY INCIDENTS: ${yearCount}`, currentStyles.yearlyBlock, "#ccccff")
  );

  // Optionally, add a live clock.
  if (currentStyles.clock.show) {
    const clockSection = document.createElement("div");
    clockSection.id = "liveClock";
    clockSection.style.flex = "none";
    clockSection.style.margin = currentStyles.clock.margin + "px";
    clockSection.style.padding = currentStyles.clock.padding + "px";
    clockSection.style.borderRadius = currentStyles.clock.borderRadius + "px";
    clockSection.style.border = currentStyles.clock.borderThickness + "px solid " + currentStyles.clock.borderColor;
    clockSection.style.backgroundColor = currentStyles.clock.backgroundColor;
    clockSection.style.width = currentStyles.clock.width + "%";
    
    const clockText = document.createElement("h3");
    clockText.style.fontSize = currentStyles.clock.fontSize + "px";
    clockText.style.color = currentStyles.clock.textColor;
    clockSection.appendChild(clockText);
    countWrap.appendChild(clockSection);
    
    function updateClock() {
      const now = new Date();
      const options = { hour: "numeric", minute: "numeric", second: "numeric", hour12: (currentStyles.clock.hourFormat !== "24") };
      clockText.innerText = now.toLocaleTimeString([], options);
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  // Optionally, signal to the tools that the preview is rendered.
  // (This could be done via a callback or state change instead of a global event.)
}

export function getCurrentStyles() {
  return globalState.getState().countBar;
}