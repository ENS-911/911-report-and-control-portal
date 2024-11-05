// components/reportControls.js
import { createPdfAndPrint } from '../formUtils/pdfUtils.js';

export function addReportControls() {
    const contentBody = document.getElementById('contentBody');
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'reportControls';
    controlsContainer.style.display = 'flex';
    controlsContainer.style.justifyContent = 'flex-end';
    controlsContainer.style.marginBottom = '20px';

    const printButton = document.createElement('button');
    printButton.id = 'printReportButton';
    printButton.textContent = 'Print';
    //const downloadButton = document.createElement('button');
    //downloadButton.id = 'downloadPdfButton';
    //downloadButton.textContent = 'Download PDF';

    controlsContainer.appendChild(printButton);
    //controlsContainer.appendChild(downloadButton);
    contentBody.insertBefore(controlsContainer, contentBody.firstChild);

    // Add event listeners for the buttons
    printButton.addEventListener('click', () => {
        console.log('Print button clicked'); // Check if this logs when the button is clicked
        createPdfAndPrint();
    });
    //downloadButton.addEventListener('click', generatePdf);     // Placeholder, assuming generatePdf is defined elsewhere
}
