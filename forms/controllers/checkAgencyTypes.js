// In a new utility function or within the new component setup
import { globalState } from '../../reactive/state.js';

export function checkAgencyTypes() {
    const reportData = globalState.getState().reportData || [];
    const uniqueAgencyTypes = new Set();

    reportData.forEach(item => {
        if (item.agency_type) {
            uniqueAgencyTypes.add(item.agency_type);
        }
    });

    const agencyTypesArray = Array.from(uniqueAgencyTypes);
    console.log("Unique Agency Types Found:", agencyTypesArray);

    return agencyTypesArray;
}
