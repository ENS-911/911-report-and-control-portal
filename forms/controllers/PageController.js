// pageController.js
import { calculateComponentHeight } from '../formUtils/measurementUtils.js';
import { getMaxPageHeight } from '../formUtils/dpiUtils.js';

class PageController {
    constructor() {
        this.pages = [];
        this.currentPage = [];
        this.currentPageHeight = 0;
        this.maxPageHeight = getMaxPageHeight();
    }

    // Start a new page
    startNewPage() {
        if (this.currentPage.length > 0) {
            this.pages.push(this.currentPage);
        }
        this.currentPage = [];
        this.currentPageHeight = 0;
    }

    // Add content to the current page or start a new page if needed
    addContentToPage(contentElement) {
        const contentHeight = calculateComponentHeight(contentElement);

        if (this.currentPageHeight + contentHeight > this.maxPageHeight) {
            this.startNewPage();
        }

        this.currentPage.push({ element: contentElement, height: contentHeight });
        this.currentPageHeight += contentHeight;
    }

    // Add multiple items and calculate page breaks as needed
    addContentItems(items) {
        items.forEach(item => this.addContentToPage(item));
    }

    // Finalize the pages and return them
    finalizePages() {
        if (this.currentPage.length > 0) {
            this.pages.push(this.currentPage); // Push the last page
        }
        return this.pages;
    }
}

export default PageController;
