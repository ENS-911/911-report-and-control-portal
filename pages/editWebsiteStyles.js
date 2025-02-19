const availableComponents = [
    { id: "countBars", name: "Count Bars", script: "count-bars/cb0.js" }
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
componentContainer.style.backgroundColor = '#ffffff'; // Default until computed
componentContainer.style.color = availableComponents.indexOf(component) % 2 === 0 ? "#000" : "#fff";
section.appendChild(componentContainer);

        // Append the section to the page
        setStage.appendChild(section);

        // Load the component dynamically
        loadComponent(
            `https://ensloadout.911emergensee.com/ens-packages/components/${component.script}`,
            componentContainer.id
        );
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

                window.ENSComponent({ rootDiv }) // Call component function
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