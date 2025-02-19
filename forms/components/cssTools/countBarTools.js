window.initializeEditTools = function (toolsContainer) {
    toolsContainer.innerHTML = "<h3>Edit Count Bars</h3>";

    function createControl(label, type, defaultValue, onChange) {
        const wrapper = document.createElement("div");
        wrapper.style.marginBottom = "10px";

        const inputLabel = document.createElement("label");
        inputLabel.innerText = label;
        inputLabel.style.display = "block";

        const input = document.createElement("input");
        input.type = type;
        input.value = defaultValue;
        input.style.width = "auto";
        input.style.minWidth = "150px";
        input.style.maxWidth = "300px";

        input.addEventListener("input", (e) => onChange(e.target.value));

        wrapper.appendChild(inputLabel);
        wrapper.appendChild(input);
        return wrapper;
    }

    const rootDivContainer = document.getElementById("componentContainer-countBar");
    if (!rootDivContainer) {
        console.error("Component container not found for countBars");
        return;
    }
    
    const observer = new MutationObserver(() => {
        if (rootDivContainer.firstChild) {
            observer.disconnect();
            initializeControls(rootDivContainer.firstChild);
        }
    });

    observer.observe(rootDivContainer, { childList: true });
    if (rootDivContainer.firstChild) {
        observer.disconnect();
        initializeControls(rootDivContainer.firstChild);
    }

    function initializeControls(rootDiv) {
        if (!rootDiv) return;

        const countSections = [
            { id: "currentCount", label: "Current Count" },
            { id: "dailyCount", label: "Daily Count" },
            { id: "yearlyCount", label: "Yearly Count" }
        ];

        countSections.forEach(({ id, label }) => {
            const sectionRow = document.createElement("div");
            sectionRow.classList.add("tool-row");

            sectionRow.appendChild(createControl(`${label} Background`, "color", "#ffffff", (value) => {
                const section = document.getElementById(id);
                if (section) section.style.backgroundColor = value;
            }));

            sectionRow.appendChild(createControl(`${label} Border Color`, "color", "#ccc", (value) => {
                const section = document.getElementById(id);
                if (section) section.style.borderColor = value;
            }));

            sectionRow.appendChild(createControl(`${label} Border Thickness`, "text", "1px", (value) => {
                const section = document.getElementById(id);
                if (section) section.style.borderWidth = value;
            }));

            sectionRow.appendChild(createControl(`${label} Border Radius`, "text", "5px", (value) => {
                const section = document.getElementById(id);
                if (section) section.style.borderRadius = value;
            }));

            sectionRow.appendChild(createControl(`${label} Width %`, "text", "33%", (value) => {
                const section = document.getElementById(id);
                if (section) section.style.width = `${value}%`;
            }));

            toolsContainer.appendChild(sectionRow);
        });

        // Live Clock Toggle
        const clockToggle = document.createElement("input");
        clockToggle.type = "checkbox";

        fetch("/api/get-styles?componentId=countBar")
            .then(response => response.json())
            .then(data => {
                if (data.styles?.showClock) {
                    clockToggle.checked = true;
                    enableClock(rootDiv);
                }
            });

        clockToggle.addEventListener("change", () => {
            if (clockToggle.checked) {
                enableClock(rootDiv);
            } else {
                disableClock(rootDiv);
            }
        });

        const clockRow = document.createElement("div");
        clockRow.classList.add("tool-row");

        clockRow.appendChild(createControl("Clock Background", "color", "#ddd", (value) => {
            const clockSection = document.getElementById("liveClock");
            if (clockSection) clockSection.style.backgroundColor = value;
        }));

        clockRow.appendChild(createControl("Clock Width %", "text", "33%", (value) => {
            const clockSection = document.getElementById("liveClock");
            if (clockSection) clockSection.style.width = `${value}%`;
        }));

        toolsContainer.appendChild(clockRow);

        const clockLabel = document.createElement("label");
        clockLabel.innerText = "Show Live Clock";
        clockLabel.appendChild(clockToggle);
        toolsContainer.appendChild(clockLabel);

        // Save Button
        const saveButton = document.createElement("button");
        saveButton.innerText = "Save Styles";
        saveButton.style.marginTop = "10px";
        saveButton.addEventListener("click", () => {
            saveStyles(rootDiv, clockToggle.checked);
        });
        toolsContainer.appendChild(saveButton);
    }
};

function saveStyles(component, showClock) {
    const styles = {
        width: component.style.width,
        padding: component.style.padding,
        backgroundColor: component.style.backgroundColor,
        sectionBackground: document.getElementById("currentCount")?.style.backgroundColor,
        borderColor: document.getElementById("currentCount")?.style.borderColor,
        borderRadius: document.getElementById("currentCount")?.style.borderRadius,
        fontSize: document.getElementById("currentCount")?.style.fontSize,
        textColor: document.getElementById("currentCount")?.style.color,
        showClock: showClock
    };

    fetch("/api/save-styles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ componentId: "countBar", styles })
    })
        .then(response => response.json())
        .then(data => console.log("Styles saved:", data))
        .catch(error => console.error("Error saving styles:", error));
}
