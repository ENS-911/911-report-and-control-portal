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

    addContentToPage(contentElement, isTitle = false) {
        const contentHeight = measureComponentHeight(contentElement);
        console.log("Measuring content for page:", {
            element: contentElement,
            height: contentHeight,
        });
    
        // Check if new content fits within the page
        if (this.currentPageHeight + contentHeight > this.maxPageHeight && !isTitle) {
            console.log("Content exceeds page height, starting a new page.");
            this.startNewPage();
        }
    
        // Add content to the current page
        this.currentPage.push({ element: contentElement, height: contentHeight });
        this.currentPageHeight += contentHeight;
    
        console.log("Content added to page:", {
            currentPage: this.currentPage,
            totalPages: this.pages.length + 1,
        });
    }
    
    finalizePages() {
        if (this.currentPage.length > 0) {
            this.pages.push(this.currentPage);
        }
    
        console.log("Finalized Pages:", this.pages);
        return this.pages;
    }
}

export default PageController;
