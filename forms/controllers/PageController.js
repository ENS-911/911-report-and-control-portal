// PageController.js

import { globalState } from '../../reactive/state.js';

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
        this.maxPageHeight = maxPageHeight; // 1056px (8.5in * 96dpi)
        this.footerHeight = footerHeight; // 50px
        this.availableSpace = this.maxPageHeight - this.footerHeight - 40; // 40px padding (20px top + 20px bottom)
        this.usedSpaceOnPage = 0; // Track used space on the current page

        this.contentBody = document.getElementById('contentBody');
        if (!this.contentBody) {
            console.error('#contentBody not found. Ensure that it exists in the DOM.');
        }

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

        // Append the page to the DOM immediately
        if (this.contentBody) {
            this.contentBody.appendChild(page);
        }

        return page;
    }

    /**
     * Adds a component to the current page. If the component exceeds available space,
     * finalizes the current page and adds the component to a new page.
     * @param {HTMLElement} component - The DOM element to add.
     * @param {boolean} isTitle - Indicates if the component is the title (affects styling if needed).
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

        // Append the component so it is in the DOM
        contentContainer.appendChild(component);

        // Wait multiple frames for rendering and layout
        await this.waitForRender();
        await this.waitForRender();

        // Measure the component's height
        const componentHeight = component.getBoundingClientRect().height;
        console.log(`Measured height for component (${component.className || component.tagName}): ${componentHeight}px`);

        // Check if adding this component exceeds available space
        if (this.usedSpaceOnPage + componentHeight > this.availableSpace) {
            console.log(`Component height (${componentHeight}px) exceeds available space (${this.availableSpace - this.usedSpaceOnPage}px) on current page. Moving to new page.`);

            // Remove the component from the current page
            contentContainer.removeChild(component);

            // Add footer to the current page
            this.addFooter(this.pages.length);

            // Create a new page
            this.currentPage = this.createNewPage();
            this.usedSpaceOnPage = 0; // Reset used space for the new page

            const newContentContainer = this.currentPage.querySelector('.content');
            if (!newContentContainer) {
                console.error("Content container not found in new page.");
                return;
            }

            // Add the component to the new page
            newContentContainer.appendChild(component);

            // Wait again for rendering on the new page
            await this.waitForRender();
            await this.waitForRender();

            const newComponentHeight = component.getBoundingClientRect().height;
            console.log(`New component height on new page: ${newComponentHeight}px`);

            // Update used space on the new page
            this.usedSpaceOnPage += newComponentHeight;

            if (newComponentHeight > this.availableSpace) {
                console.warn(`Component itself is larger than a single page (${newComponentHeight}px > ${this.availableSpace}px). Consider splitting it.`);
            } else {
                console.log(`Component added to new page (${this.pages.length}). Used space: ${this.usedSpaceOnPage}px`);
            }
        } else {
            // Fits on the current page
            this.usedSpaceOnPage += componentHeight;
            console.log(`Component added to current page (${this.pages.length}). Used space: ${this.usedSpaceOnPage}px of ${this.availableSpace}px`);
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

    /**
     * Starts a new page by adding a footer to the current page and creating a new one.
     */
    async startNewPage() {
        // Add footer to the current page
        this.addFooter(this.pages.length);

        // Create a new page
        this.currentPage = this.createNewPage();
        this.usedSpaceOnPage = 0; // Reset used space for the new page
    }

    /**
     * Adds additional height to the current page's used space.
     * @param {number} height - The height to add.
     */
    addHeightToCurrentPage(height) {
        this.usedSpaceOnPage += height;
    }

    /**
     * Gets the available space on the current page.
     * @returns {number} - The available space in pixels.
     */
    getAvailableSpace() {
        return this.availableSpace;
    }

    /**
     * Gets the used space on the current page.
     * @returns {number} - The used space in pixels.
     */
    getUsedSpaceOnPage() {
        return this.usedSpaceOnPage;
    }

    clearContent() {
        const contentContainer = this.currentPage.querySelector('.content');
        this.contentContainer.innerHTML = '';
    }
}

export default PageController;
