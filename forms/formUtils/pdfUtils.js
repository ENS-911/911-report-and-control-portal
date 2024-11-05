// formUtils/pdfUtils.js

// pdfUtils.js

export async function createPdfAndPrint() {
    const pages = document.querySelectorAll('.page');
    if (pages.length === 0) {
        console.error('No pages found to generate PDF.');
        return;
    }

    const pdf = new window.jspdf.jsPDF('p', 'mm', 'letter'); // Access jsPDF as window.jspdf.jsPDF
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i], { scale: 2, useCORS: true, scrollY: -window.scrollY });
        if (i > 0) pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/jpeg'), 'JPEG', 0, 0, pdfWidth, pdfHeight);
    }

    const pdfBlobUrl = pdf.output('bloburl');
    printPdf(pdfBlobUrl);
}

function printPdf(pdfBlobUrl) {
    console.log('printPdf called with URL:', pdfBlobUrl);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = pdfBlobUrl;
    iframe.onload = function () {
        iframe.contentWindow.print();
    };
    document.body.appendChild(iframe);
}


export function formatDateForFilename(date) {
    const year = date.getFullYear();
    const month = padZero(date.getMonth() + 1);
    const day = padZero(date.getDate());
    const hours = padZero(date.getHours());
    const minutes = padZero(date.getMinutes());
    const seconds = padZero(date.getSeconds());
    return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
}

function padZero(number) {
    return number < 10 ? '0' + number : number;
}
