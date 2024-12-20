// PageController.js

import { globalState } from '../../reactive/state.js'; // Adjust the path as necessary
import { createFooter } from '../components/footer.js'; // Adjust the path as necessary

/**
 * PageController manages the creation and organization of report pages.
 * It ensures that components are added sequentially without exceeding page limits.
 */
class PageController {
    /**
     * Initializes the PageController with specified page and footer dimensions.
     * @param {number} maxPageHeight - The maximum height of a page in pixels.
     * @param {number} footerHeight - The height of the footer in pixels.
     */
    constructor(maxPageHeight = 1056, footerHeight = 50) {
        this.pages = []; // Array to hold all created pages
        this.maxPageHeight = maxPageHeight; // e.g., 1056px (8.5in * 96dpi)
        this.footerHeight = footerHeight; // e.g., 50px
        this.padding = 40; // 20px top + 20px bottom padding
        this.availableSpace = this.maxPageHeight - this.footerHeight - this.padding; // Usable space per page
        this.usedSpaceOnPage = 0; // Tracks used space on the current page

        this.contentBody = document.getElementById('contentBody'); // Container for all pages
        if (!this.contentBody) {
            console.error('#contentBody not found. Ensure that it exists in the DOM.');
        }

        this.currentPage = this.createNewPage(); // Initialize with the first page
    }

    /**
     * Creates a new report page with content and footer containers.
     * @returns {HTMLElement} - The newly created report page element.
     */
    createNewPage() {
        const page = document.createElement('div');
        page.className = 'report-page';
        page.style.position = 'relative'; // To position footer correctly

        // Create content container
        const content = document.createElement('div');
        content.className = 'content';
        page.appendChild(content);

        // Create footer container
        const footerContainer = document.createElement('div');
        footerContainer.className = 'page-footer-container'; // Separate container for footer
        page.appendChild(footerContainer);

        this.pages.push(page);

        // Append the page to the DOM immediately
        if (this.contentBody) {
            this.contentBody.appendChild(page);
            console.log(`Appended new page (${this.pages.length}) to #contentBody.`);
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

        // Append the component to the content container
        contentContainer.appendChild(component);

        // Wait for rendering to ensure accurate measurements
        await this.waitForRender();
        await this.waitForRender();

        // Measure the component's height
        const componentHeight = component.getBoundingClientRect().height;

        // Check if adding this component exceeds available space
        if (this.usedSpaceOnPage + componentHeight > this.availableSpace) {

            // Remove the component from the current page
            contentContainer.removeChild(component);

            // Finalize the current page by adding a footer
            this.addFooter(this.pages[this.pages.length - 1], this.pages.length);

            // Create a new page
            this.startNewPage();
            this.usedSpaceOnPage = 0; // Reset used space for the new page

            const newContentContainer = this.currentPage.querySelector('.content');
            if (!newContentContainer) {
                console.error("Content container not found in new page.");
                return;
            }

            // Add the component to the new page
            newContentContainer.appendChild(component);

            // Wait for rendering again
            await this.waitForRender();
            await this.waitForRender();

            const newComponentHeight = component.getBoundingClientRect().height;

            // Update used space on the new page
            this.addHeightToCurrentPage(newComponentHeight);
        } else {
            // Fits on the current page
            this.usedSpaceOnPage += componentHeight;
        }
    }

    /**
     * Adds a footer to the specified page using the createFooter function.
     * @param {HTMLElement} page - The page element to add the footer to.
     * @param {number} pageNumber - The current page number (1-based index).
     */
    addFooter(page, pageNumber) {
        if (!(page instanceof HTMLElement)) {
            console.error("Invalid page element.");
            return;
        }

        const footerContainer = page.querySelector('.page-footer-container');
        if (!footerContainer) {
            console.error("Footer container not found in the provided page.");
            return;
        }

        // Create the footer using createFooter function
        const footer = createFooter(pageNumber, this.pages.length);

        // Append the footer to the footer container
        footerContainer.appendChild(footer);
    }

    /**
     * Finalizes all pages by adding footers to pages without them.
     * This should be called after all components have been added.
     * @returns {Array<HTMLElement>} - The array of finalized pages.
     */
    finalizePages() {
        const totalPages = this.pages.length;
        this.pages.forEach((page, index) => {
            const footerContainer = page.querySelector('.page-footer-container');
            const footer = footerContainer.querySelector('.page-footer');
            const hasFooter = footer && footer.innerHTML.trim() !== '';
            if (!hasFooter) {
                this.addFooter(page, index + 1);
            }
        });
        return this.pages; // Return the pages array
    }

    /**
     * Waits for the next animation frame to ensure rendering is complete.
     * @returns {Promise} - Resolves after two animation frames.
     */
    waitForRender() {
        return new Promise(resolve => {
            requestAnimationFrame(() => {
                resolve();
            });
        });
    }

    /**
     * Clears all existing pages and resets internal state.
     * Typically called before generating a new report.
     */
    clearContent() {
        // Remove all existing pages from the DOM
        this.pages.forEach(page => {
            if (this.contentBody.contains(page)) {
                this.contentBody.removeChild(page);
                console.log('Removed a page from the DOM.');
            }
        });
        // Reset internal state
        this.pages = [];
        this.usedSpaceOnPage = 0;
        // Create a new page
        this.currentPage = this.createNewPage();
    }

    /**
     * Starts a new page and sets it as the current page.
     */
    startNewPage() {
        const newPage = this.createNewPage();
        this.currentPage = newPage;
        this.usedSpaceOnPage = 0;
    }

    /**
     * Adds the given height to the used space on the current page.
     * @param {number} height - The height to add in pixels.
     */
    addHeightToCurrentPage(height) {
        this.usedSpaceOnPage += height;
    }

    /**
     * Gets the used space on the current page.
     * @returns {number} - The used space in pixels.
     */
    getUsedSpaceOnPage() {
        return this.usedSpaceOnPage;
    }

    /**
     * Gets the available space on the current page.
     * @returns {number} - The available space in pixels.
     */
    getAvailableSpace() {
        return this.availableSpace;
    }
}

export default PageController;
