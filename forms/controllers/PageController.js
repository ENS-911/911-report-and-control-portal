// pageController.js
import { measureComponentHeight, measureFooterHeight } from '../formUtils/measurementUtils.js';
import { globalState } from '../../reactive/state.js';
import { getMaxPageHeight } from '../formUtils/dpiUtils.js';

// Set max page height and footer height initially, without modifying state
const footerHeight = measureFooterHeight();
const baseMaxPageHeight = getMaxPageHeight();
const adjustedMaxPageHeight = baseMaxPageHeight - footerHeight; // Calculate once, outside the class
console.log('THIS IS WHAT IS PASSED IN AS THE FOOTER HEIGHT: ', footerHeight)

class PageController {
    constructor() {
        this.pages = [];
        this.currentPage = [];
        this.currentPageHeight = 0;
        this.maxPageHeight = globalState.getState().maxPageHeight || 816; // Default page height
        this.availablePageHeight = adjustedMaxPageHeight;
    }

    // Start a new page
    startNewPage() {
        if (this.currentPage.length > 0) {
            this.pages.push(this.currentPage);
        }
        this.currentPage = [];
        this.currentPageHeight = 0;
    }

    // Add content to the page
    addContentToPage(contentElement, isTitle = false) {
        const contentHeight = measureComponentHeight(contentElement);

        // Check for page break
        if (this.currentPageHeight + contentHeight > this.maxPageHeight && !isTitle) {
            this.startNewPage();
        }

        // Add content to the current page
        this.currentPage.push({ element: contentElement, height: contentHeight });
        this.currentPageHeight += contentHeight;
    }

    // Finalize pages for rendering
    finalizePages() {
        if (this.currentPage.length > 0) {
            this.pages.push(this.currentPage);
        }
        return this.pages;
    }
}

export default PageController;
