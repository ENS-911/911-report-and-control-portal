// PageController.js

import { globalState } from '../reactive/state.js';

/**
 * PageController manages the creation and organization of report pages.
 * It ensures that components are added sequentially without exceeding page limits.
 */
class PageController {
    /**
     * Initializes the PageController with a fixed page size.
     * @param {number} maxPageHeight - The maximum height of a page in pixels.
     * @param {number} footerHeight - The height of the footer in pixels.
     */
    constructor(maxPageHeight = 1056, footerHeight = 50) {
        this.pages = [];
        this.maxPageHeight = maxPageHeight; // 1056px
        this.footerHeight = footerHeight; // 50px
        this.availableSpace = this.maxPageHeight - this.footerHeight - 40; // 40px padding (20px top + 20px bottom)
        this.sizeOnPage = 0; // Tracks cumulative height on the current page
        this.currentPage = this.createNewPage();
    }

    /**
     * Creates a new report page with content and footer containers.
     * @returns {HTMLElement} - The newly created report page element.
     */
    createNewPage() {
        const page = document.createElement('div');
        page.className = 'report-page';

        // Create content container
        const content = document.createElement('div');
        content.className = 'content';
        page.appendChild(content);

        // Create footer container
        const footer = document.createElement('div');
        footer.className = 'page-footer';
        page.appendChild(footer);

        this.pages.push(page);
        return page;
    }

    /**
     * Adds a component to the current page. If the component exceeds available space,
     * finalizes the current page and adds the component to a new page.
     * @param {HTMLElement} component - The DOM element to add.
     * @param {boolean} isTitle - Indicates if the component is the title.
     */
    async addContentToPage(component, isTitle = false) {
        if (!(component instanceof HTMLElement)) {
            console.error('Invalid component type:', component);
            return;
        }

        const contentContainer = this.currentPage.querySelector('.content');
        if (!contentContainer) {
            console.error("Content container not found in current page.");
            return;
        }

        // Append the component to the content container
        contentContainer.appendChild(component);
        console.log(`Added component to current page (${this.pages.length}).`);

        // Wait for the browser to render the component
        await this.waitForRender();

        // Measure the height of the component
        const componentHeight = component.getBoundingClientRect().height;
        console.log(`Measured height for component (${component.className || component.tagName}): ${componentHeight}px`);

        // Update cumulative height
        this.sizeOnPage += componentHeight;
        console.log(`Current content height after adding component: ${this.sizeOnPage}px`);

        // Check if exceeding page size
        if (this.sizeOnPage >= this.availableSpace) {
            console.log(`Page size exceeded. Finalizing current page and creating a new one.`);
            // Remove the component that caused overflow
            contentContainer.removeChild(component);

            // Add footer to current page
            this.addFooter(this.pages.length);

            // Create a new page
            this.currentPage = this.createNewPage();
            this.sizeOnPage = 0; // Reset for the new page

            // Add the component to the new page
            const newContentContainer = this.currentPage.querySelector('.content');
            if (!newContentContainer) {
                console.error("Content container not found in new page.");
                return;
            }

            newContentContainer.appendChild(component);
            console.log(`Added component to new page (${this.pages.length}).`);

            // Wait for the browser to render the component
            await this.waitForRender();

            // Re-measure the component's height in the new page
            const newComponentHeight = component.getBoundingClientRect().height;
            console.log(`Measured height for component on new page: ${newComponentHeight}px`);

            // Update current content height
            this.sizeOnPage += newComponentHeight;
            console.log(`New page content height after adding component: ${this.sizeOnPage}px`);

            if (newComponentHeight > this.availableSpace) {
                console.warn(`Component height (${newComponentHeight}px) exceeds available space on the new page (${this.availableSpace}px). Consider splitting the component.`);
                // Optionally handle oversized components here, e.g., split tables across pages
            }
        }
    }

    /**
     * Adds a footer to the specified page.
     * @param {number} pageNumber - The current page number (1-based index).
     */
    addFooter(pageNumber) {
        const footer = this.currentPage.querySelector('.page-footer');
        if (!footer) {
            console.error("Footer container not found in current page.");
            return;
        }

        const leftSection = document.createElement('div');
        leftSection.className = 'footer-left';

        const formattedDateTime = new Date().toLocaleString();
        leftSection.innerHTML = `
            <p>Report Generated: ${formattedDateTime}</p>
            <p>Page ${pageNumber} of ${this.pages.length}</p>
        `;

        const centerSection = document.createElement('div');
        centerSection.className = 'footer-center';
        centerSection.textContent = globalState.getState().reportTitle || 'Report Title';

        const rightSection = document.createElement('div');
        rightSection.className = 'footer-right';
        const userInfo = JSON.parse(localStorage.getItem('user')) || {};
        rightSection.innerHTML = `
            <p>Report Generated By: ${userInfo.fname || ''} ${userInfo.lname || ''}</p>
            <p>Created With: 911 Emerge-N-See Report Generator</p>
        `;

        // Clear existing footer content and append new sections
        footer.innerHTML = '';
        footer.appendChild(leftSection);
        footer.appendChild(centerSection);
        footer.appendChild(rightSection);
    }

    /**
     * Finalizes all pages by adding footers to pages without them.
     * @returns {Array<HTMLElement>} - The array of finalized pages.
     */
    finalizePages() {
        this.pages.forEach((page, index) => {
            const footer = page.querySelector('.page-footer');
            const hasFooter = footer && footer.innerHTML.trim() !== '';
            if (!hasFooter) {
                this.addFooter(index + 1);
            }
        });
        return this.pages; // Return the pages array
    }

    /**
     * Waits for the next animation frame to ensure rendering is complete.
     * @returns {Promise} - Resolves after one animation frame.
     */
    waitForRender() {
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                resolve();
            });
        });
    }
}

export default PageController;
