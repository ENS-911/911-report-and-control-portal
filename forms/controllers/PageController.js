// PageController.js

import { measureFooterHeight } from '../formUtils/measurementUtils.js';
import { getMaxPageHeight } from '../formUtils/dpiUtils.js';

class PageController {
    constructor() {
        this.pages = [];
        this.currentPage = [];
        this.currentPageHeight = 0;
        this.footerHeight = 0;
        this.maxPageHeight = 0; // Will be set after footer height measurement
    }

    // Initialize PageController with footer height and max page height
    async initialize() {
        this.footerHeight = await measureFooterHeight();
        const baseMaxPageHeight = getMaxPageHeight();
        this.maxPageHeight = baseMaxPageHeight - this.footerHeight;
        console.log(`Initialized PageController with maxPageHeight: ${this.maxPageHeight}px`);
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
    async addContentToPage(contentElement, contentHeight) {
        console.log("Adding content to the page:", contentElement);
        this.currentPage.push(contentElement);
        this.currentPageHeight += contentHeight;
        console.log("Updated current page height:", this.currentPageHeight);
    }

    // Finalize pages and return the array of pages
    finalizePages() {
        if (this.currentPage.length > 0) {
            this.pages.push([...this.currentPage]);
            console.log('Finalized pages. Total pages:', this.pages.length);
        } else {
            console.log('No content in current page to finalize.');
        }
        return this.pages;
    }
}

export default PageController;
