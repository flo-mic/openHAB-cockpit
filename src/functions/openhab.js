import { readFile, sendCommand, replaceFile, sendScript } from "./cockpit.js";

import "core-js/stable";
import "regenerator-runtime/runtime";

// check if oh2 or oh3 is installed
export async function getInstalledopenHAB() {
    // run bash script to check where openhab is installed
    var result = await sendCommand(["./openhab2-isInstalled.sh"], "/opt/openhab-cockpit/src/scripts");
    if (result !== undefined && result !== "") {
        if (result.includes("openHAB2")) {
            return "openHAB2";
        }
        if (result.includes("openHAB3")) {
            return "openHAB3";
        }
    }
    console.error(
        "Can not detect if openHAB2 or openHAB3 is installed. Return value is undefined."
    );
}

// returns the openhab version that the openhab-cli displays
export async function getopenHABVersion() {
    try {
        var result = await sendCommand(["openhab-cli", "info"]);
        if (result !== undefined && result !== "") {
            if (result.includes("Version:")) {
                return result.split("Version:")[1].split("\n")[0].trim();
            }
        }
        console.error(
            "Can not read openHAB version from openhab-cli."
        );
    } catch (exception) {
        console.error(
            "Can not read openHAB version from openhab-cli. Exception: \n" + exception
        );
    }
}

// returns the openhab urls from the openhab-cli as object
export async function getopenHABURLs() {
    var result = await sendCommand(["openhab-cli", "info"]);
    if (result !== undefined && result !== "") {
        if (result.includes("http://") && result.includes("https://")) {
            var http = "http://" + result.split("http://")[1].split("\n")[0].trim();
            var https = "https://" + result.split("https://")[1].split("\n")[0].trim();
            return { http: http, https: https };
        }
    }
    console.error(
        "Can not read openHAB urls from openhab-cli."
    );
}

// returns the openhab log directory
export async function getopenHABLogDir() {
    try {
        var result = await sendCommand(["openhab-cli", "info"]);
        if (result !== undefined && result !== "") {
            if (result.includes("OPENHAB_LOGDIR")) {
                return result.split("OPENHAB_LOGDIR")[1].split("|")[1].trim();
            }
        }
        console.error(
            "Can not read openHAB log path from openhab-cli."
        );
    } catch (exception) {
        console.error(
            "Can not read openHAB log path from openhab-cli. Exception: \n" + exception
        );
    }
}

// returns the openhab backup directory
export async function getopenHABBackupDir() {
    try {
        var result = await sendCommand(["openhab-cli", "info"]);
        if (result !== undefined && result !== "") {
            if (result.includes("OPENHAB_BACKUPS")) {
                return result.split("OPENHAB_BACKUPS")[1].split("|")[1].trim();
            }
        }
        console.error(
            "Can not read openHAB backup path from openhab-cli."
        );
    } catch (exception) {
        console.error(
            "Can not read openHAB backup path from openhab-cli. Exception: \n" + exception
        );
    }
}

// returns the service name of the installed openhab
export async function getopenHABServiceName() {
    var result = await getInstalledopenHAB();
    if (result !== undefined && result !== "") {
        if (result.includes("openHAB2")) {
            return "openhab2";
        }
        if (result.includes("openHAB3")) {
            return "openhab";
        }
    }
    console.error(
        "Can not read the openhab service name."
    );
}

// read the service status of openHAB
export async function getServiceStatus() {
    var openhab = await getopenHABServiceName();
    var result = await sendCommand([
        "systemctl",
        "show",
        "-p",
        "SubState",
        "--value",
        openhab + ".service",
    ]);
    if (result !== undefined && result !== "") {
        return result;
    }
    console.error(
        "Can not read the service status of '" + openhab + "'. Return value is undefined"
    );
}

// read openhab service details
export async function sendServiceCommand(command) {
    sendCommand(["systemctl", command, await getopenHABServiceName()]);
}

// read the openhab repository
export async function getopenHABRepo() {
    var result = await readFile("/etc/apt/sources.list.d/openhab.list");
    if (result !== undefined && result !== "") {
        return result;
    }
    console.error("Can not read openHAB repo from file '/etc/apt/sources.list.d/openhab.list'. String is empty.");
}

// get the openhab branch from the repo
export async function getopenHABBranch() {
    try {
        var repo = await getopenHABRepo();
        var release = "deb https://dl.bintray.com/openhab/apt-repo2 stable main";
        var testing = "deb https://openhab.jfrog.io/artifactory/openhab-linuxpkg testing main";
        var snapshot = "deb https://openhab.jfrog.io/artifactory/openhab-linuxpkg unstable main";
        if (repo.includes(release) && !repo.includes("#" + release)) return "release";
        if (repo.includes(testing) && !repo.includes("#" + testing)) return "testing";
        if (repo.includes(snapshot) && !repo.includes("#" + snapshot)) return "snapshot";
    } catch (exception) {
        console.error("Can not read the openHAB Branch from the repo string. Exception: \n" + exception);
    }
}

// get openhab console ip
export async function getopenHABConsoleIP() {
    var openhab = await getopenHABServiceName();
    try {
        var result = await readFile("/var/lib/" + openhab + "/etc/org.apache.karaf.shell.cfg");
        if (result !== undefined && result !== "") {
            if (result.includes("sshHost =")) {
                return result.split("sshHost =")[1].split("\n")[0].trim();
            }
        }
        console.error(
            "Can not read openHAB console ip from file '/var/lib/" + openhab + "/etc/org.apache.karaf.shell.cfg'."
        );
    } catch (exception) {
        console.error("There was an error while reading the console ip from file '/var/lib/" + openhab + "/etc/org.apache.karaf.shell.cfg'. Exception: \n" + exception);
    }
}

// get openhab console ip
export async function getopenHABConsolePort() {
    var openhab = await getopenHABServiceName();
    try {
        var result = await readFile("/var/lib/" + openhab + "/etc/org.apache.karaf.shell.cfg");
        if (result !== undefined && result !== "") {
            if (result.includes("sshPort =")) {
                return result.split("sshPort =")[1].split("\n")[0].trim();
            }
        }
        console.error(
            "Can not read openHAB console port from file '/var/lib/" + openhab + "/etc/org.apache.karaf.shell.cfg'."
        );
    } catch (exception) {
        console.error("There was an error while reading the console port from file '/var/lib/" + openhab + "/etc/org.apache.karaf.shell.cfg'. Exception: \n" + exception);
    }
}

// configures the openHAB remote console ip and port
export async function setopenHABRemoteConsole(ip, port) {
    var path = "/var/lib/" + await getopenHABServiceName() + "/etc/org.apache.karaf.shell.cfg";
    var data = await readFile(path);
    var currentIP = await getopenHABConsoleIP();
    data = data.replace("sshHost = " + currentIP, "sshHost = " + ip);
    var currentPort = await getopenHABConsolePort();
    data = data.replace("sshPort = " + currentPort, "sshPort = " + port);
    sendServiceCommand("restart");
    return await replaceFile(path, data);
}

// installs the selected openhab
export async function installopenHAB(openhab, branch) {
    var result = await sendCommand(["./openhab-setup.sh", openhab, branch], "/opt/openhab-cockpit/src/scripts");
    if (result === undefined || result === "") {
        result = "There was an error while installing openhab version '" + openhab + "' with branch '" + branch + "'.";
    }
    return result;
}

// get openhab backups
export async function getopenHABBackups() {
    var directory = await getopenHABBackupDir();
    var backups = [];
    try {
        var result = await sendScript("ls -lah | awk '{print $9, $5}' | tail -5", [], directory);
        if (result !== undefined && result !== "") {
            result.split("\n").forEach(element => {
                if (element.trim() !== "" && !element.startsWith(". ") && !element.startsWith(".. ")) {
                    var name = element.split(" ")[0];
                    backups.push({ name: name, size: element.split(" ")[1], date: getDateFromBackupName(name) });
                }
            });
            return backups;
        }
    } catch (exception) {
        console.error("There was an error while reading available openHAB backups in '" + directory + "'. Exception: \n" + exception);
    }
}

function getDateFromBackupName(name) {
    var tmp = (name.split("-")[2] + "_" + name.split("-")[3].split(".")[0]).split("_");
    return new Date("20" + tmp[0] + "-" + tmp[1] + "-" + tmp[2] + "T" + tmp[3] + ":" + tmp[4] + ":" + tmp[5] + "Z");
}
