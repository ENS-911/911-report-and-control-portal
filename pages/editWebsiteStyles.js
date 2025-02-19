const availableComponents = [
    { id: "countBar", name: "Count Bars", script: "count-bars/cb0.js" }
    // More components can be added here later
];

export function loadPage() {
    const setStage = document.getElementById('contentBody');
    
    availableComponents.forEach((component) => {
        // Create a section for each component
        const section = document.createElement("div");
        section.id = `section-${component.id}`;
        section.classList.add("component-section");
        section.style.width = "100%";
        section.style.marginTop = "15px";

        // Section Title
        const title = document.createElement("h2");
        title.innerText = component.name;
        title.style.width = "100%";
        title.style.backgroundColor = "#d3d3d3";
        title.style.padding = "8px 0";
        title.style.textAlign = "center";
        section.appendChild(title);

        // Component Container
        const componentContainer = document.createElement("div");
        componentContainer.id = `componentContainer-${component.id}`;
        componentContainer.classList.add("component-container");
        componentContainer.style.width = "100%";
        componentContainer.style.padding = "20px";
        componentContainer.style.backgroundColor = '#ffffff'; 
        section.appendChild(componentContainer);

        // Edit Tools Container (Loads under the component)
        const toolsContainer = document.createElement("div");
        toolsContainer.id = `toolsContainer-${component.id}`;
        toolsContainer.classList.add("tools-container");
        toolsContainer.style.marginTop = "10px";
        section.appendChild(toolsContainer);

        // Append the section to the page
        setStage.appendChild(section);

        // Load the component and the tools dynamically
        loadComponent(
            `https://ensloadout.911emergensee.com/ens-packages/components/${component.script}`,
            componentContainer.id
        );

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
            if (window.ENSComponent) {
                const rootDiv = document.getElementById(containerId);
                if (!rootDiv) return reject(`Container ${containerId} not found`);

                window.ENSComponent({ rootDiv })
                    .then(() => resolve())
                    .catch(reject);
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
        script.src = `./forms/components/cssTools/${toolsScript}`; // Load tools from cssTool folder
        script.type = "text/javascript";
        script.async = true;

        script.onload = () => {
            if (window.initializeEditTools) {
                const toolsDiv = document.getElementById(containerId);
                if (!toolsDiv) return reject("Tools container not found");

                window.initializeEditTools(toolsDiv); // Call edit tools setup function
                resolve();
            } else {
                reject("Edit tools function not found after script load");
            }
        };

        script.onerror = () => reject("Failed to load edit tools script");
        document.body.appendChild(script);
    });
}
