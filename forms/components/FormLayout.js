// FormLayout.js
import { showLoadingScreen, removeLoadingScreen } from '../formUtils/loadingScreen.js';
import { measureRowAndHeaderHeights, measureFooterHeight, measureTitleHeight, getPageHeight } from '../formUtils/measurementUtils.js';
import { splitDataIntoPages, generatePages } from '../components/pageBuilder.js';
import { addReportControls } from '../components/reportControls.js';

export function generateReport(title, data) {
    const contentBody = document.getElementById('contentBody');
    contentBody.innerHTML = '';

    showLoadingScreen();

    setTimeout(() => {
        const { rowHeight, headerHeight } = measureRowAndHeaderHeights();
        const footerHeight = measureFooterHeight();
        const titleHeight = measureTitleHeight(title);
        const totalPageHeight = getPageHeight();
        
        const availableContentHeightPage1 = totalPageHeight - footerHeight - titleHeight;
        const availableContentHeightOtherPages = totalPageHeight - footerHeight - 10;
        
        const pagesData = splitDataIntoPages(data, availableContentHeightPage1, availableContentHeightOtherPages, rowHeight, headerHeight);

        removeLoadingScreen();
        generatePages(title, pagesData);
        addReportControls();
    }, 0);
}
