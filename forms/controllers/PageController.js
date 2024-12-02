import { measureComponentHeight, measureFooterHeight } from '../formUtils/measurementUtils.js';
import { getMaxPageHeight, calculateAndSaveScaleRatio } from '../formUtils/dpiUtils.js';

const footerHeight = measureFooterHeight();
const baseMaxPageHeight = getMaxPageHeight();
const adjustedMaxPageHeight = baseMaxPageHeight - footerHeight;
const contentBody = document.getElementById('contentBody');
const containerWidth = 0.9 * contentBody.offsetWidth;

class PageController {
    constructor() {
        this.pages = [];
        this.currentPage = [];
        this.currentPageHeight = 0;
        this.maxPageHeight = adjustedMaxPageHeight; // Adjusted once for content
    }

    // Start a new page and push to pages array
    startNewPage() {
        console.log("Starting a new page...");
        if (this.currentPage.length > 0) {
            this.pages.push([...this.currentPage]); // Push a copy to avoid mutation
        }
        this.currentPage = [];
        this.currentPageHeight = 0;
        console.log("New page started. Current total pages:", this.pages.length);
    }

    // Add content to the current page and manage page breaks
    addContentToPage(contentElement, isTitle = false) {
        const contentHeight = measureComponentHeight(contentElement);
        console.log("Measured content height:", contentHeight);

        if (!contentHeight) {
            console.error("Content height could not be measured:", contentElement);
            return;
        }

        // Check if the content fits on the current page
        if (this.currentPageHeight + contentHeight > this.maxPageHeight && !isTitle) {
            console.log("Content exceeds max page height. Starting a new page...");
            this.startNewPage();
        }

        // Add content to the current page
        console.log("Adding content to the page:", contentElement);
        this.currentPage.push({ element: contentElement, height: contentHeight });
        this.currentPageHeight += contentHeight;
        console.log("Updated current page height:", this.currentPageHeight);
    }

    // Finalize pages and return the array of pages
    finalizePages() {
        if (this.currentPage.length > 0) {
            console.log("Finalizing current page...");
            this.pages.push([...this.currentPage]); // Push a copy to avoid mutation
        }

        console.log("Finalized Pages Data:", this.pages);
        calculateAndSaveScaleRatio(containerWidth);
        return this.pages;
    }
}

export default PageController;
