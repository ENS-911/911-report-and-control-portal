// createDivComponent.js

export function createDivComponent(className, contentHTML = '') {
    const div = document.createElement('div');
    div.className = className;
    div.innerHTML = contentHTML;
    return div;
}
