import { flattenStyles } from "../forms/formUtils/flattenStyles.js";

const availableComponents = [
    { id: "countBar", name: "Count Bars", script: "count-bars/cb0.js" },
    //{ id: "mapBox", name: "Map Box", script: "mapbox/mb0.js" },
    //{ id: "statWidget", name: "Stat Widget", script: "stat-widget/sw0.js" },
    //{ id: "imageSlider", name: "Image Slider", script: "image-slider/is0.js" },
    //{ id: "newsTicker", name: "News Ticker", script: "news-ticker/nt0.js" },
    //{ id: "socialFeed", name: "Social Feed", script: "social-feed/sf0.js" }
];

export function loadPage() {
    const setStage = document.getElementById('contentBody');
    
    availableComponents.forEach((component) => {
        // Create a section container for the component
        const section = document.createElement("div");
        section.id = `section-${component.id}`;
        section.classList.add("component-section");
        section.style.width = "100%";
        section.style.marginTop = "15px";

        // Section Title (Component name)
        const title = document.createElement("h2");
        title.innerText = component.name;
        title.style.width = "100%";
        title.style.backgroundColor = "#d3d3d3";
        title.style.padding = "8px 0";
        title.style.textAlign = "center";
        section.appendChild(title);

        // Preview Container (where the component will render)
        const componentContainer = document.createElement("div");
        componentContainer.id = `componentContainer-${component.id}`;
        componentContainer.classList.add("component-container");
        componentContainer.style.width = "100%";
        componentContainer.style.padding = "20px";
        componentContainer.style.backgroundColor = "#ffffff"; 
        section.appendChild(componentContainer);

        // Edit Tools Container (for adjustments)
        const toolsContainer = document.createElement("div");
        toolsContainer.id = `toolsContainer-${component.id}`;
        toolsContainer.classList.add("tools-container");
        toolsContainer.style.marginTop = "10px";
        section.appendChild(toolsContainer);

        // Optionally, you could include a dedicated preview area.
        // For example, if you want one central preview for all components:
        // const previewContainer = document.createElement("div");
        // previewContainer.id = `previewContainer-${component.id}`;
        // section.appendChild(previewContainer);

        // Append the component section to the control panel stage
        setStage.appendChild(section);

        // Dynamically load the component (its preview)
        loadComponent(
            `https://ensloadout.911emergensee.com/ens-packages/components/${component.script}`,
            componentContainer.id
        );

        // Dynamically load the edit tools for this component.
        // Naming convention: the tools file is named as {component.id}Tools.js
        loadEditTools(`${component.id}Tools.js`, toolsContainer.id);
    });
}

function loadComponent(scriptUrl, containerId) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = scriptUrl;
      script.type = "text/javascript";
      script.async = true;
  
      script.onload = () => {
        // Verify that the component initializer exists.
        if (typeof window.ENSComponent === "function") {
          const rootDiv = document.getElementById(containerId);
          if (!rootDiv) return reject(`Container ${containerId} not found`);
          
          // Flatten the nested styles and pass them in.
          const flatStyles = flattenStyles(window.countBarStyles);
          window.ENSComponent({ rootDiv, styles: flatStyles });
          resolve();
        } else {
          reject("ENSComponent not found after script load");
        }
      };
  
      script.onerror = () => reject("Failed to load script");
      document.body.appendChild(script);
    });
}

function loadEditTools(toolsScript, containerId) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `./forms/components/cssTools/${toolsScript}`; // Tools loaded from cssTools folder
        script.type = "text/javascript";
        script.async = true;

        script.onload = () => {
            if (window.initializeEditTools) {
                const toolsDiv = document.getElementById(containerId);
                if (!toolsDiv) return reject("Tools container not found");

                // Call the edit tools initializer for this component.
                window.initializeEditTools(toolsDiv);
                resolve();
            } else {
                reject("Edit tools function not found after script load");
            }
        };

        script.onerror = () => reject("Failed to load edit tools script");
        document.body.appendChild(script);
    });
}
