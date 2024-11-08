// utils/dpiUtils.js

export function getMaxPageHeight() {
    const dpi = getSystemDPI(); // Use your existing DPI function
    const inchesToPixels = dpi * 11; // Convert 11 inches to pixels based on DPI
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

  