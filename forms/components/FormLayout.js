export function generateReport(title, data) {
    const contentBody = document.getElementById('contentBody');
    contentBody.innerHTML = ''; // Clear previous content

    showLoadingScreen();

    // Wait for the loading screen to render
    setTimeout(() => {
        // Measure row and header heights
        const { rowHeight, headerHeight } = measureRowAndHeaderHeights();

        // Measure footer height
        const footerHeight = measureFooterHeight();

        // Measure title height
        const titleHeight = measureTitleHeight(title);

        // Calculate the total page height
        const totalPageHeight = getPageHeight();

        // Calculate the available content height for pages
        const availableContentHeightPage1 = totalPageHeight - footerHeight - titleHeight - 40; // Adjust for padding/margins
        const availableContentHeightOtherPages = totalPageHeight - footerHeight - 40; // For pages without title

        // Split data into pages
        const pagesData = splitDataIntoPages(
            data,
            availableContentHeightPage1,
            availableContentHeightOtherPages,
            rowHeight,
            headerHeight
        );

        // Remove the loading screen
        removeLoadingScreen();

        // Generate the pages
        generatePages(title, pagesData);

        addReportControls();
        updatePrintArea();
    }, 0);
}

// Helper function to show the loading screen
function showLoadingScreen() {
    const contentBody = document.getElementById('contentBody');

    // Create the loading screen container
    const loadingScreen = document.createElement('div');
    loadingScreen.id = 'loadingScreen';
    loadingScreen.className = 'page';

    // Create the loading content wrapper
    const loadingContent = document.createElement('div');
    loadingContent.className = 'loading-content';

    // Create the spinner
    const spinner = document.createElement('div');
    spinner.className = 'spinner';

    // Create the loading message
    const loadingMessage = document.createElement('p');
    loadingMessage.textContent = 'Generating your report...';

    // Append elements together
    loadingContent.appendChild(spinner);
    loadingContent.appendChild(loadingMessage);
    loadingScreen.appendChild(loadingContent);
    contentBody.appendChild(loadingScreen);
}

// Helper function to remove the loading screen
function removeLoadingScreen() {
    const contentBody = document.getElementById('contentBody');
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        contentBody.removeChild(loadingScreen);
    }
}

// Function to calculate the page height based on the current width and A4 aspect ratio
function getPageHeight() {
    const loadingScreen = document.getElementById('loadingScreen');
    const pageWidth = loadingScreen.offsetWidth;
    const aspectRatio = 297 / 210; // A4 aspect ratio
    const pageHeight = pageWidth * aspectRatio;
    return pageHeight;
}

// Function to measure row and header heights
function measureRowAndHeaderHeights() {
    // Create temporary elements
    const tempTable = document.createElement('table');
    tempTable.className = 'report-table';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');

    // Define your headers (same as in TableComponent)
    const headers = ['Agency Type', 'Battalion', 'Creation Date', 'Premise', 'Description'];

    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    tempTable.appendChild(thead);

    const tbody = document.createElement('tbody');
    const row = document.createElement('tr');

    // Create sample cells with typical content
    for (let i = 0; i < headers.length; i++) {
        const td = document.createElement('td');
        td.textContent = 'Sample Data';
        row.appendChild(td);
    }

    tbody.appendChild(row);
    tempTable.appendChild(tbody);

    // Append to the loading screen to get accurate measurements
    const loadingScreen = document.getElementById('loadingScreen');
    loadingScreen.appendChild(tempTable);

    const headerHeight = thead.offsetHeight;
    const rowHeight = row.offsetHeight;

    // Clean up
    loadingScreen.removeChild(tempTable);

    return { rowHeight, headerHeight };
}

function splitDataIntoPages(data, availableContentHeightPage1, availableContentHeightOtherPages, rowHeight, headerHeight) {
    const pages = [];
    let currentPageData = [];
    let currentPageHeight = headerHeight; // Start with header height
    let pageNumber = 1;

    data.forEach((item) => {
        currentPageData.push(item);
        currentPageHeight += rowHeight;

        // Determine the max content height for the current page
        const maxContentHeight = pageNumber === 1 ? availableContentHeightPage1 : availableContentHeightOtherPages;

        // Check if adding another row exceeds the available content height
        if (currentPageHeight > maxContentHeight) {
            pages.push(currentPageData);
            currentPageData = [];
            currentPageHeight = headerHeight + rowHeight; // Reset for next page, include current item
            pageNumber++;
        }
    });

    // Add any remaining data
    if (currentPageData.length > 0) {
        pages.push(currentPageData);
    }

    return pages;
}

// Function to generate pages
function generatePages(title, pagesData) {
    const contentBody = document.getElementById('contentBody');
    contentBody.innerHTML = ''; // Clear previous content

    const totalPages = pagesData.length;

    pagesData.forEach((pageData, index) => {
        const pageNumber = index + 1; // Page numbers start at 1
        const { pageContainer, pageContent } = createPageContainer(pageNumber, totalPages);

        // Add title on the first page content
        if (pageNumber === 1) {
            const headerTitle = document.createElement('h1');
            headerTitle.textContent = title;
            pageContent.appendChild(headerTitle);
        }

        // Create the table with pageData
        const tableComponent = createTableComponent(pageData);
        pageContent.appendChild(tableComponent);

        contentBody.appendChild(pageContainer);
    });
}

function createPageContainer(pageNumber, totalPages) {
    const pageContainer = document.createElement('div');
    pageContainer.className = 'page';

    // Get user info
    const { fname, lname } = getUserInfo();

    // Create the content wrapper
    const pageContent = document.createElement('div');
    pageContent.className = 'page-content';

    // Create the footer
    const footer = document.createElement('div');
    footer.className = 'page-footer';

    // Generate the date and time
    const generatedDate = new Date().toLocaleString();

    // Assemble the footer content
    footer.innerHTML = `
        <div class="footer-content">
            <div class="foot">
                <span>Report Generated: ${generatedDate}</span>
                <span>Generated By: ${fname} ${lname}</span>
            </div>
            <div class="foot">
                <span>Page ${pageNumber} of ${totalPages}</span>
                <span>Report generated with: 911 Emerge-N-See report generator</span>
            </div>
        </div>
    `;

    // Append content and footer to the page container
    pageContainer.appendChild(pageContent);
    pageContainer.appendChild(footer);

    return { pageContainer, pageContent };
}

function getUserInfo() {
    const user = JSON.parse(localStorage.getItem('user'));
    const fname = user?.fname || 'First Name';
    const lname = user?.lname || 'Last Name';
    return { fname, lname };
}

function measureFooterHeight() {
    // Create a temporary footer element
    const tempFooter = document.createElement('div');
    tempFooter.className = 'page-footer';
    tempFooter.style.visibility = 'hidden'; // Hide it from view

    // Generate the date and time
    const generatedDate = new Date().toLocaleString();
    const { fname, lname } = getUserInfo();

    // Set the footer content
    tempFooter.innerHTML = `
        <div class="footer-content">
            <div class="foot">
                <span>Report Generated: ${generatedDate}</span>
                <span>Generated By: ${fname} ${lname}</span>
            </div>
            <div class="foot">
                <span>
                    Page 1 of 1
                </span>
                <span>Report generated with: 911 Emerge-N-See report generator</span>
            </div>
        </div>
    `;

    // Append it to the body temporarily
    document.body.appendChild(tempFooter);

    // Get the height
    const footerHeight = tempFooter.offsetHeight;

    // Remove it from the DOM
    document.body.removeChild(tempFooter);

    return footerHeight;
}

function measureTitleHeight(title) {
    // Create a temporary h1 element
    const tempTitle = document.createElement('h1');
    tempTitle.textContent = title;
    tempTitle.style.visibility = 'hidden'; // Hide it from view

    // Append it to the body temporarily
    document.body.appendChild(tempTitle);

    // Get the height
    const titleHeight = tempTitle.offsetHeight;

    // Remove it from the DOM
    document.body.removeChild(tempTitle);

    return titleHeight;
}

function addReportControls() {
    const contentBody = document.getElementById('contentBody');

    // Create a container for the buttons
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'reportControls';
    controlsContainer.style.display = 'flex';
    controlsContainer.style.justifyContent = 'flex-end';
    controlsContainer.style.marginBottom = '20px';

    // Create the Print button
    const printButton = document.createElement('button');
    printButton.id = 'printReportButton';
    printButton.textContent = 'Print';
    printButton.style.marginRight = '10px';

    // Create the Download PDF button
    const downloadButton = document.createElement('button');
    downloadButton.id = 'downloadPdfButton';
    downloadButton.textContent = 'Download PDF';

    // Append buttons to the controls container
    controlsContainer.appendChild(printButton);
    controlsContainer.appendChild(downloadButton);

    // Insert the controls container before the first page
    if (contentBody.firstChild) {
        contentBody.insertBefore(controlsContainer, contentBody.firstChild);
    } else {
        contentBody.appendChild(controlsContainer);
    }

    // Add event listeners for the buttons
    printButton.addEventListener('click', () => {
        createPdfAndPrint();
    });

    downloadButton.addEventListener('click', () => {
        generatePdf();
    });
}

async function createPdfAndPrint() {
    const pages = document.querySelectorAll('.page');

    if (pages.length === 0) {
        console.error('No pages found to generate PDF.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'letter');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Loop over each .page element
    for (let i = 0; i < pages.length; i++) {
        const page = pages[i];

        // Check if the page has content
        if (!page.innerHTML.trim()) {
            console.warn(`Skipping empty page at index ${i}`);
            continue;
        }

        // Make sure the page is visible
        page.style.display = 'block';

        // Capture the page content using html2canvas
        const canvas = await html2canvas(page, {
            scale: 2,
            useCORS: true,
            scrollY: -window.scrollY,
            windowWidth: page.scrollWidth,
            windowHeight: page.scrollHeight,
        });

        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        if (imgWidth === 0 || imgHeight === 0) {
            console.error(`Canvas has zero dimensions for page ${i + 1}. Skipping this page.`);
            continue;
        }

        // Calculate the image size for the PDF page
        const scaleFactor = pdfWidth / imgWidth;
        const targetHeight = imgHeight * scaleFactor;

        // Check if scaling is correct
        if (isNaN(targetHeight) || targetHeight <= 0) {
            console.error(`Invalid target height for page ${i + 1}. Skipping this page.`);
            continue;
        }

        const imgData = canvas.toDataURL('image/jpeg', 0.9);

        // Add a new page for each image, skipping the first new page
        if (i > 0) {
            pdf.addPage();
        }

        // Add the image to the PDF and fit it to the page
        try {
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, targetHeight > pdfHeight ? pdfHeight : targetHeight);
        } catch (error) {
            console.error(`Error adding image to PDF on page ${i + 1}:`, error);
            continue;
        }
    }

    // Output the PDF as a Blob URL and call print function
    const pdfBlobUrl = pdf.output('bloburl');
    printPdf(pdfBlobUrl);
}

function printPdf(pdfBlobUrl) {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = pdfBlobUrl;

    iframe.onload = function () {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
    };

    document.body.appendChild(iframe);
}

// Helper function to format date/time for filenames
function formatDateForFilename(date) {
    // Get components of the date
    const year = date.getFullYear();
    const month = padZero(date.getMonth() + 1); // Months are zero-based
    const day = padZero(date.getDate());
    const hours = padZero(date.getHours());
    const minutes = padZero(date.getMinutes());
    const seconds = padZero(date.getSeconds());

    // Combine into a string
    return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
}

function padZero(number) {
    return number < 10 ? '0' + number : number;
}

function createPdf() {
    const contentBody = document.getElementById('contentBody');
    
    // Hide the controls temporarily
    const controls = contentBody.querySelector('#reportControls');
    if (controls) {
        controls.style.display = 'none';
    }
    
    // Adjust styles for PDF generation
    contentBody.style.width = '210mm'; // Set to A4 width
    contentBody.style.minHeight = '297mm'; // Set to A4 height

    // **Retrieve and sanitize the report title**
    const reportTitleElement = contentBody.querySelector('h1');
    let reportTitle = reportTitleElement ? reportTitleElement.textContent.trim() : 'Report';
    reportTitle = reportTitle.replace(/[\\/:*?"<>|]/g, '');

    // **Get the current date/time and format it**
    const generatedDate = new Date();
    const dateString = formatDateForFilename(generatedDate);

    // **Create the filename**
    const filename = `${reportTitle}-${dateString}.pdf`;

    // Generate the PDF
    const opt = {
        margin:       0,
        filename:     filename,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  {
            scale: 2,
            useCORS: true, // Use CORS to load images if needed
            logging: true, // Enable logging for debugging
            scrollY: -window.scrollY // Ensure the content is captured from the top
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };

    html2pdf().set(opt).from(contentBody).save().then(() => {
        // Show the controls again
        if (controls) {
            controls.style.display = '';
        }

        // Reset styles
        contentBody.style.width = '';
        contentBody.style.minHeight = '';
    });
}

function updatePrintArea() {
    const printArea = document.getElementById('printArea');
    printArea.innerHTML = ''; // Clear previous content

    // Select all .page elements
    const pages = document.querySelectorAll('.page');
    console.log('Number of pages found:', pages.length);

    pages.forEach((page, index) => {
        // Clone each page
        const pageClone = page.cloneNode(true);
        printArea.appendChild(pageClone);
        console.log('Cloned page:', index + 1);
    });
}

// Export createTableComponent if it's not in tableComponent.js
import { createTableComponent } from './tableComponent.js'; // Adjust the import path accordingly
