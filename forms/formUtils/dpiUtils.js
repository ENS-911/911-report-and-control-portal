// utils/dpiUtils.js
import { globalState } from '../../reactive/state.js';

export function calculateAndSaveScaleRatio(customWidth) {
    const dpi = getSystemDPI();
    const actualWidthInInches = customWidth / dpi;
    const scaleRatio = actualWidthInInches / 8.5; // Based on 8.5 inches width
    
    // Save the scaleRatio in the global state
    globalState.setState({ scaleRatio });
    console.log("Scale ratio saved to state:", scaleRatio);
    return scaleRatio;
}

export function getMaxPageHeight() {
    const dpi = getSystemDPI(); // Use your existing DPI function
    const inchesToPixels = dpi * 8.5; // Convert 11 inches to pixels based on DPI
    return inchesToPixels;
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

export function getPageDimensions(width) {
    const aspectRatio = 11 / 8.5; // Aspect ratio for an 8.5 x 11 page
    const height = width * aspectRatio;
    return { width, height };
}