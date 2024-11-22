export async function fetchReportData(reportType, reportFilters, clientKey) {
    if (!clientKey) {
        throw new Error("Client key is required to fetch report data.");
    }

    try {
        const queryParams = new URLSearchParams(reportFilters).toString();
        const url = `https://matrix.911-ens-services.com/report/${clientKey}?${queryParams}`;

        console.log("Fetching URL:", url);

        const response = await fetch(url);

        if (!response.ok) {
            const errorDetails = await response.json().catch(() => ({}));
            throw new Error(`API call failed. Status: ${response.status}. Details: ${JSON.stringify(errorDetails)}`);
        }

        const reportData = await response.json();
        console.log("Fetched report data:", reportData);

        return reportData;
    } catch (error) {
        console.error("Error in fetchReportData:", error);
        throw error;
    }
}
