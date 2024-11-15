// utils/dpiUtils.js
import { globalState } from '../../reactive/state.js';

export function calculateAndSaveScaleRatio(customWidth) {
    const dpi = getSystemDPI();
    const actualWidthInInches = customWidth / dpi;
    let scaleRatio = actualWidthInInches / 8.5; // Based on 8.5 inches width
    scaleRatio = parseFloat(scaleRatio.toFixed(1));
    // Save the scaleRatio in the global state
    globalState.setState({ scaleRatio });
    console.log("Scale ratio saved to state:", scaleRatio);
    return scaleRatio;
}

export function getMaxPageHeight() {
    const dpi = getSystemDPI(); // Use your existing DPI function
    const maxPageHeight = dpi * 11; 
    globalState.setState({ maxPageHeight });
    return maxPageHeight;
}

export function getSystemDPI() {
    // Sample DPI calculation logic; replace with your specific implementation
    const div = document.createElement("div");
    div.style.width = "1in";
    document.body.appendChild(div);
    const dpi = div.offsetWidth;
    document.body.removeChild(div);
    return dpi;
}

export function getPageDimensions(containerWidth) {
    const aspectRatio = 11 / 8.5; // Should be exactly 1.2941
    const height = containerWidth * aspectRatio;
    return { width: containerWidth, height: Math.round(height) }; // Rounded for pixel alignment
}