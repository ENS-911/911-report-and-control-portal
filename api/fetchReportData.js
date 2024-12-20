import { globalState } from "../reactive/state.js";

export async function fetchReportData(reportFilters) {
    const clientKey = globalState.getState().clientData?.key;
    if (!clientKey) {
        throw new Error("Client key is missing. Please ensure you are authenticated.");
    }

    const queryParams = new URLSearchParams(reportFilters).toString();
    const url = `https://matrix.911-ens-services.com/report/${clientKey}?${queryParams}`;

    console.log("Fetching URL:", url);

    const response = await fetch(url);
    if (!response.ok) {
        let errorDetails = {};
        try {
            errorDetails = await response.json();
        } catch (parseError) {
            console.warn("Unable to parse error details:", parseError);
        }
        throw new Error(`API call failed. Status: ${response.status}. Details: ${JSON.stringify(errorDetails)}`);
    }

    const reportData = await response.json();
    console.log("Fetched report data:", reportData);

    // DO NOT set global state here, just return the data
    return reportData;
}
