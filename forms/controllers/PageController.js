// pageController.js
import { measureComponentHeight } from '../formUtils/measurementUtils.js';
import { getSystemDPI } from '../formUtils/dpiUtils.js';

class PageController {
    constructor() {
        this.pages = [];
        this.currentPage = [];
        this.currentPageHeight = 0;
        this.maxPageHeight = 11; // Set max height to 11 inches
        this.dpi = getSystemDPI();
        this.scaleRatio = this.calculateScalingRatio();
    }

    calculateScalingRatio() {
        const screenWidth = document.getElementById('contentBody').offsetWidth;
        const actualWidthInInches = screenWidth / this.dpi;
        return actualWidthInInches / 8.5; // Scale based on true 8.5 inches
    }

    // Start a new page and push current page content to pages array
    startNewPage() {
        if (this.currentPage.length > 0) {
            this.pages.push(this.currentPage);
        }
        this.currentPage = [];
        this.currentPageHeight = 0;
    }

    // Add a content element, scale if needed, and check page limits
    addContentToPage(contentElement) {
        const contentHeight = measureComponentHeight(contentElement);
    
        console.log("Attempting to add component:", contentElement, "Height:", contentHeight);
    
        // Check if adding this component would exceed maxPageHeight
        if (this.currentPageHeight + contentHeight > this.maxPageHeight) {
            this.startNewPage(); // Push current page to pages and start a new one
        }
    
        // Add the component to the current page and update height
        this.currentPage.push({ element: contentElement, height: contentHeight });
        this.currentPageHeight += contentHeight;
    }

    finalizePages() {
        if (this.currentPage.length > 0) {
            this.pages.push(this.currentPage); // Add the last page
        }
        console.log("Final structured pages data:", this.pages);
        return this.pages;
    }
}

export default PageController;
