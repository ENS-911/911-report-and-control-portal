// PageController.js
import { measureComponentHeight, measureFooterHeight } from '../formUtils/measurementUtils.js';
import { getMaxPageHeight } from '../formUtils/dpiUtils.js';

const footerHeight = measureFooterHeight();
const baseMaxPageHeight = getMaxPageHeight();
const adjustedMaxPageHeight = baseMaxPageHeight - footerHeight;

class PageController {
    constructor() {
        this.pages = [];
        this.currentPage = [];
        this.currentPageHeight = 0;
        this.maxPageHeight = adjustedMaxPageHeight; // Adjusted once for content
    }

    // Start a new page and push to pages array
    startNewPage() {
        if (this.currentPage.length > 0) {
            this.pages.push(this.currentPage);
        }
        this.currentPage = [];
        this.currentPageHeight = 0;
    }

    // Add content and manage page breaks
    addContentToPage(contentElement, isTitle = false) {
        const contentHeight = measureComponentHeight(contentElement);

        // Only trigger page break if content exceeds available height
        if (this.currentPageHeight + contentHeight > this.maxPageHeight && !isTitle) {
            this.startNewPage();
        }

        // Add content to the current page
        this.currentPage.push({ element: contentElement, height: contentHeight });
        this.currentPageHeight += contentHeight;
    }

    // Finalize pages
    finalizePages() {
        if (this.currentPage.length > 0) {
            this.pages.push(this.currentPage);
        }
        console.log("Finalized Pages Data:", this.pages);
        return this.pages;
    }
}

export default PageController;
