import cockpit from "cockpit";
import React from "react";
import OHServiceDetails from "./modules/service_details.jsx";
import OHBranchSelector from "./modules/openhab_branch_selector.jsx";
import { Card, CardBody, CardTitle } from "@patternfly/react-core";

import "./custom.scss";
import "./patternfly.scss";

export default class OHStatus extends React.Component {
    get_details() {
        this.getInstalledopenHAB();
        this.get_oh_service_status();
        this.get_oh_cli_details();
        this.get_oh_selected_branch();
    }

    // read data from the openhab cli
    get_oh_cli_details() {
        var proc = cockpit.spawn(["openhab-cli", "info"]);
        proc.stream((data) => {
            this.get_oh_cli_version(data);
            this.get_oh_cli_urls(data);
        });
    }

    // read openhab version from oh cli
    get_oh_cli_version(data) {
        data.split("\n").forEach((element) => {
            if (element.includes("Version:")) {
                this.setState({
                    version: element.split("Version:")[1].trim(),
                    github_release_link:
            "https://github.com/openhab/openhab-distro/releases/tag/" +
            element.split("Version:")[1].split("(")[0].trim(),
                });
            }
        });
    }

    // read openhab urls from oh cli
    get_oh_cli_urls(data) {
        data.split("\n").forEach((element) => {
            if (element.includes("URLs:")) {
                this.setState({
                    url: (
                        <div>
                            <a
                target="_blank"
                rel="noopener noreferrer"
                href={element.split("URLs:")[1].trim()}
                            >
                                {element.split("URLs:")[1].trim()}
                            </a>
                            <br />
                            <a
                target="_blank"
                rel="noopener noreferrer"
                href={element
                        .split("URLs:")[1]
                        .trim()
                        .replace("http://", "https://")}
                            >
                                {element
                                        .split("URLs:")[1]
                                        .trim()
                                        .replace("http://", "https://")}
                            </a>
                        </div>
                    ),
                });
            }
        });
    }

    // check if oh service is running or dead
    get_oh_service_status() {
        var proc = cockpit.spawn([
            "systemctl",
            "show",
            "-p",
            "SubState",
            "--value",
            "openhab.service",
        ]);
        proc.stream((data) => {
            this.setState({ serviceStatus: data });
        });
    }

    // read the selected oh branch
    get_oh_selected_branch() {
        cockpit
                .file("/etc/apt/sources.list.d/openhab.list")
                .read()
                .then((data, tag) => {
                    this.setState({
                        openhabBranch: this.get_oh_branch_from_repo_string(data),
                    });
                });
    }

    // checks which oh branch is used input is the apt source list content
    get_oh_branch_from_repo_string(data) {
        if (
            data.includes(
                "deb https://dl.bintray.com/openhab/apt-repo2 stable main"
            ) &&
      !data.includes(
          "#deb https://dl.bintray.com/openhab/apt-repo2 stable main"
      )
        ) {
            return "release";
        }
        if (
            data.includes(
                "deb https://openhab.jfrog.io/artifactory/openhab-linuxpkg unstable main"
            ) &&
      !data.includes(
          "#deb https://openhab.jfrog.io/artifactory/openhab-linuxpkg unstable main"
      )
        ) {
            return "snapshot";
        }
        if (
            data.includes(
                "deb https://openhab.jfrog.io/artifactory/openhab-linuxpkg testing main"
            ) &&
      !data.includes(
          "#deb https://openhab.jfrog.io/artifactory/openhab-linuxpkg testing main"
      )
        ) {
            return "testing";
        }
        return "-";
    }

    // check if oh2 or oh3 is installed
    getInstalledopenHAB() {
        var proc = cockpit.spawn(["./openhab2-isInstalled.sh"], {
            superuser: "require",
            err: "out",
            directory: "/opt/openhab-cockpit/src/scripts",
        });
        proc.then((data) => {
            if (data.includes("openHAB2")) {
                this.setState({ openhab: "openHAB2" });
                return;
            }
            if (data.includes("openHAB3")) {
                this.setState({ openhab: "openHAB3" });
                return;
            }
            console.error(
                'Detected openhab version "' +
          data +
          '" is not detected as openHAB2 or openHAB3.'
            );
        });
        proc.catch((exception, data) => {
            console.error(
                "Error while reading openHAB version 2 or 3 from system. Readed data: \n" +
          data +
          "\n\n Exception: \n" +
          exception
            );
        });
    }

    constructor() {
        super();
        this.state = {
            version: "-",
            openhab: "openHAB3",
            openhabBranch: "-",
            github_release_link:
        "https://github.com/openhab/openhab-distro/releases/",
            serviceEnabled: "-",
            serviceStatus: "-",
            url: "-",
            showBrancheSelector: false,
            showServiceDetails: false,
            modalContent: <div />,
        };
        // Opens the branche selector menue
        this.handleBrancheSelector = (e) => {
            if (this.state.showBrancheSelector == false) {
                this.setState({
                    showBrancheSelector: true,
                    modalContent: (
                        <OHBranchSelector
              onClose={this.handleBrancheSelector}
              branch={this.state.openhabBranch}
              openhab={this.state.openhab}
                        />
                    ),
                });
            } else {
                this.setState({
                    showBrancheSelector: false,
                    modalContent: <div />,
                });
                this.get_details();
            }
        };

        // Opens the service status details
        this.handleServiceDetails = (e) => {
            if (this.state.showServiceDetails == false) {
                this.setState({
                    showServiceDetails: true,
                    modalContent: (
                        <OHServiceDetails
                  openhab={this.state.openhab}
                  onClose={this.handleServiceDetails}
                        />
                    ),
                });
            } else {
                this.setState({
                    showServiceDetails: false,
                    modalContent: <div />,
                });
            }
        };

    /* Modal action handler end */
    }

    /* Runs when component is build */
    componentDidMount() {
        this.get_details();
        this.interval = setInterval(() => this.get_oh_service_status(), 15000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        return (
            <Card className="system-configuration">
                <CardTitle style={{ paddingLeft: "16px" }}>
                    {this.state.openhab} status
                </CardTitle>
                <CardBody>
                    <div>{this.state.modalContent}</div>
                    <table className="pf-c-table pf-m-grid-md pf-m-compact">
                        <tbody>
                            <tr>
                                <th scope="row">Version: </th>
                                <td>
                                    <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={this.state.github_release_link}
                                    >
                                        {this.state.version}
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">Branch: </th>
                                <td>
                                    <a
                    onClick={(e) => {
                        this.handleBrancheSelector();
                    }}
                                    >
                                        {this.state.openhabBranch}
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row">Service: </th>
                                <td>
                                    <a
                    onClick={(e) => {
                        this.handleServiceDetails();
                    }}
                                    >
                                        {this.state.serviceStatus}
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <th style={{ paddingRight: "-2rem" }} scope="row">
                                    URLs:{" "}
                                </th>
                                <td>{this.state.url}</td>
                            </tr>
                        </tbody>
                    </table>
                </CardBody>
            </Card>
        );
    }
}
