// formUtils/measurementUtils.js

export function measureComponentHeight(component) {
    return new Promise((resolve) => {
        const rect = component.getBoundingClientRect();
        resolve(rect.height);
    });
}

export async function measureFooterHeight() {
    const footer = document.querySelector('footer'); // Adjust selector as needed
    if (!footer) {
        console.warn('Footer not found.');
        return 0;
    }
    const footerHeight = await measureComponentHeight(footer);
    console.log(`Measured Footer Height: ${footerHeight}px`);
    return footerHeight;
}

export function measureTitleHeight(title) {
    const tempTitle = document.createElement('h1');
    tempTitle.textContent = title;
    tempTitle.style.visibility = 'hidden';

    measurementArea.appendChild(tempTitle);
    const titleHeight = tempTitle.offsetHeight;
    measurementArea.removeChild(tempTitle);

    return titleHeight;
}

export function getPageHeight() {
    const pageWidth = 0.9 * document.getElementById('contentBody').offsetWidth;
    const aspectRatio = 8.5 / 11;
    return pageWidth * aspectRatio;
}
