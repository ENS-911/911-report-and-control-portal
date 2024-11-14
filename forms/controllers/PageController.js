// pageController.js
import { measureComponentHeight } from '../formUtils/measurementUtils.js';
import { globalState } from '../../reactive/state.js';
import { getMaxPageHeight } from '../formUtils/dpiUtils.js';

getMaxPageHeight()

class PageController {
    constructor() {
        this.pages = [];
        this.currentPage = [];
        this.currentPageHeight = 0;
        this.maxPageHeight = globalState.getState().maxPageHeight || 816; // Default or dynamically set height
    }

    // Start a new page and log action
    startNewPage() {
        console.log(`Starting a new page. Current page height: ${this.currentPageHeight}`);
        if (this.currentPage.length > 0) {
            this.pages.push(this.currentPage);
        }
        this.currentPage = [];
        this.currentPageHeight = 0;
    }

    // Add content to the current page and trigger a page break if needed
    addContentToPage(contentElement, isTitle = false) {
        const contentHeight = measureComponentHeight(contentElement);

        console.log(`Adding row to page. Row height: ${contentHeight}, Current page height: ${this.currentPageHeight}, Max page height: ${this.maxPageHeight}`);
        
        console.log(`Attempting to add ${isTitle ? 'Title' : 'Row'} to current page. Component height: ${contentHeight}, currentPageHeight: ${this.currentPageHeight}, maxPageHeight: ${this.maxPageHeight}`);
        
        // Check if a new page is needed
        if (this.currentPageHeight + contentHeight > this.maxPageHeight && !isTitle) {
            this.startNewPage();
        }

        // Add content to current page and update height
        this.currentPage.push({ element: contentElement, height: contentHeight });
        this.currentPageHeight += contentHeight;
        console.log(`Added ${isTitle ? 'Title' : 'Row'} to page. New currentPageHeight: ${this.currentPageHeight}`);
    }

    // Finalize pages for rendering
    finalizePages() {
        if (this.currentPage.length > 0) {
            this.pages.push(this.currentPage); // Final push for any remaining content
        }
        console.log("Final structured pages data:", this.pages);
        return this.pages;
    }
}

export default PageController;
