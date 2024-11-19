// checkAgencyTypes.js
import { globalState } from '../../reactive/state.js';

export function checkAgencyTypes(reportData) {
    if (!reportData || reportData.length === 0) {
        console.warn("No report data provided for agency type check.");
        return [];
    }

    console.log('Data for agency check:', reportData);

    const uniqueAgencyTypes = new Set(
        reportData.map((item) => item.agency_type).filter(Boolean)
    );

    const agencyTypesArray = Array.from(uniqueAgencyTypes);
    console.log("Unique Agency Types Found:", agencyTypesArray);

    return agencyTypesArray;
}
