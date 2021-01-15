import { sendCommand } from "./cockpit.js";
import { validateResponse } from "./helpers.js";

import "core-js/stable";
import "regenerator-runtime/runtime";

export const openhabianScriptPath = "/opt/openhab-cockpit/src/scripts";
const openhabianStub = "openhabian-stub.sh";

// call a function from openhabian
export async function callFunction(functionArray) {
    // add openhabian stub to array
    functionArray.unshift("./" + openhabianStub);
    // run command
    return await sendCommand(functionArray, openhabianScriptPath);
}

// update openhabian config openhabian
export async function updateopenHABianConfig() {
    return await callFunction(["update_openhabian_conf"]);
}

// applys inprovments
export async function applyImprovments(selectedPackage) {
    await updateopenHABianConfig();
    return await sendCommand(["./openhabian-apply-improvments.sh", selectedPackage], openhabianScriptPath);
}

// checks for the default system password returns true if password changed
export async function defaultSystemPasswordChanged() {
    var data = await callFunction(["system_check_default_password"], openhabianScriptPath);
    if (validateResponse(data)) {
        return true;
    } else {
        return false;
    }
}

// checks for the default system password
export async function setDefaultSystemPassword(password) {
    var data = await sendCommand(["./change-default-password.sh", password], openhabianScriptPath);
    return data.replace(password, "YOURPASSWORD");
}
