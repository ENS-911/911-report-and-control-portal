// pageController.js
import { measureComponentHeight } from '../formUtils/measurementUtils.js';
import { getMaxPageHeight } from '../formUtils/dpiUtils.js';

class PageController {
    constructor() {
        this.pages = [];
        this.currentPage = [];
        this.currentPageHeight = 0;
        this.maxPageHeight = getMaxPageHeight();
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

    addContentToPage(contentElement, isTitle = false) {
        const contentHeight = measureComponentHeight(contentElement);
        const contentItem = { element: contentElement, height: contentHeight, isTitle };

        // Start new page if needed
        if (this.currentPageHeight + contentHeight > this.maxPageHeight) {
            this.pages.push(this.currentPage);
            this.currentPage = [];
            this.currentPageHeight = 0;
        }

        // Add content to the page
        this.currentPage.push(contentItem);
        this.currentPageHeight += contentHeight;
    }
    
    // Finalize the pages and avoid pushing an empty page
    finalizePages() {
        if (this.currentPage.length > 0) {
            this.pages.push(this.currentPage);
        }
        return this.pages;
    }

}

export default PageController;
