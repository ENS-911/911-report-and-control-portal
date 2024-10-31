// Import necessary modules or state if required
// import { ... } from '...';

export function FormLayout({ title, children }) {
    const contentBody = document.getElementById('contentBody');
    contentBody.innerHTML = ''; // Clear previous content

    // Create the page container and content wrapper
    const { pageContainer, pageContent } = createPageContainer();

    // Append the title
    const header = document.createElement('h1');
    header.textContent = title;
    pageContent.appendChild(header);

    // Append all children to the page content
    if (children && children.length > 0) {
        children.forEach(child => {
            pageContent.appendChild(child);
        });
    }

    // Append the page container to the content body
    contentBody.appendChild(pageContainer);
}

// Helper function to calculate the page height based on the current width and A4 aspect ratio
function calculatePageHeight() {
    const aspectRatio = 297 / 210; // Height / Width for A4
    const pageWidth = document.body.clientWidth; // Get the current width of the body or container
    const pageHeight = pageWidth * aspectRatio;
    return pageHeight;
}

function createPageContainer() {
    const pageContainer = document.createElement('div');
    pageContainer.className = 'page';

    // No need to set styles here; they're handled in CSS

    // Create the content wrapper
    const pageContent = document.createElement('div');
    pageContent.className = 'page-content';
    pageContainer.appendChild(pageContent);

    return { pageContainer, pageContent };
}


// Function to paginate content across pages
function paginateContent(contentElements) {
    const contentBody = document.getElementById('contentBody');
    let currentPage = createPageContainer();
    contentBody.appendChild(currentPage);

    const pageHeight = currentPage.clientHeight;

    // Create a fragment to hold elements temporarily
    let fragment = document.createDocumentFragment();

    contentElements.forEach((element, index) => {
        // Append the element to the fragment
        fragment.appendChild(element);

        // Append the fragment to the current page
        currentPage.appendChild(fragment);

        // Force reflow to ensure accurate measurements
        void currentPage.offsetHeight;

        // Check if the content overflows the current page
        if (currentPage.scrollHeight > pageHeight) {
            // Remove the element that caused the overflow
            currentPage.removeChild(element);

            // Create a new page
            currentPage = createPageContainer();
            contentBody.appendChild(currentPage);

            // Append the element to the new page
            currentPage.appendChild(element);
        }

        // Clear the fragment for the next iteration
        fragment = document.createDocumentFragment();
    });
}
