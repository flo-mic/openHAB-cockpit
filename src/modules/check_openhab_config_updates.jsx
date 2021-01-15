import React from "react";
import Modal from "../components/modal.jsx";
import ProgressDialog from "../components/progress-dialog.jsx";
import { Alert } from "@patternfly/react-core";
import { sendCommand, sendScript } from "../functions/cockpit.js";

import "../custom.scss";
import "../patternfly.scss";
import "core-js/stable";
import "regenerator-runtime/runtime";

export default class CheckOpenHABCockpitUpdates extends React.Component {
    // checking for updates on github
    async checkForUpdates() {
        var data = await sendCommand(["git", "fetch", "--dry-run"], "/opt/openhab-cockpit");
        // if prcess returns empty string, no update is available
        if (data === "") {
            this.setState({
                updatesAvailable: false,
            });
            return;
        }
        // if result containssomething an update will be available
        this.setState({ updatesAvailable: true });
    }

    // updates the openHAB-cockpit
    async update() {
        this.setState({ showMenu: false, installingUpdates: true, disableModalClose: true });
        var data = await sendScript(
            `
            rm -r /opt/openhab-cockpit
            git clone https://github.com/flo-mic/openHAB-cockpit.git /opt/openhab-cockpit
            cd openhab-cockpit
            chmod +x src/scripts/*.sh
            mkdir -p /usr/share/cockpit/openhab
            cp -r dist/* /usr/share/cockpit/openhab
            `,
            [], "/opt");

        if (data.toLowerCase().includes("error") || data.toLowerCase().includes("failed")) {
            this.installFailure(data);
        } else {
            this.installSuccesful(data);
        }
    }

    // will be called if installation was succesfull
    installSuccesful(data) {
        console.log("New updates for openHAB-cockpit installed.\n" + data);
        this.setState(
            {
                installingUpdates: false,
                showResult: true,
                consoleMessage: data,
                successful: true,
                disableModalClose: false,
            });
        this.checkForUpdates();
    }

    // will be called if installation failed
    installFailure(data) {
        var message = "Error could not install the latest openHAB-cockpit updates. Output: \n" + data;
        console.error(message);
        this.setState({
            installingUpdates: false,
            showResult: true,
            successful: false,
            consoleMessage: message,
            disableModalClose: false,
        });
    }

    constructor() {
        super();
        this.state = {
            updatesAvailable: false,
            installingUpdates: false,
            successful: true,
            showMenu: true,
            showModal: false,
            showResult: false,
            consoleMessage: "Update done. Please reload the page to see them.",
            disableModalClose: false,
        };
        // handles the modal dialog
        this.handleModalShow = (e) => {
            this.setState({
                showModal: !this.state.showModal,
            });
        };
    }

    componentDidMount() {
        this.checkForUpdates();
    }

    componentWillUnmount() {
    }

    render() {
        const showUpdatesAvailable = this.state.updatesAvailable
            ? "display-block"
            : "display-none";

        const showMenu = !this.state.showMenu
            ? "display-none"
            : "display-block";

        const showInstallDialog = !this.state.showMenu
            ? "display-block"
            : "display-none";

        return (
            <div>
                <div className={showUpdatesAvailable}>
                    <Alert
            isInline
            variant="info"
            title="Updates for openHAB-cockpit are available."
                    >
                        <p>
                            There are new improvements for this application available.{" "}
                            <a
                onClick={(e) => {
                    this.handleModalShow();
                }}
                            >
                                Click here to install the improvments.
                            </a>
                        </p>
                    </Alert>
                </div>
                <Modal
          disableModalClose={this.state.disableModalClose}
          onClose={this.handleModalShow}
          show={this.state.showModal}
          header="Update openHAB-cockpit"
                >
                    <div className={showMenu}>
                        <div style={{ paddingTop: "0.5rem" }} className="div-full-center">
                            <button
                className="pf-c-button pf-m-primary"
                onClick={(e) => {
                    this.update();
                }}
                            >
                                Update
                            </button>
                        </div>
                    </div>
                    <div className={showInstallDialog}>
                        <ProgressDialog
            onClose={this.handleModalShow}
            packageName="openHAB-cockpit"
            showResult={this.state.showResult}
            message={this.state.consoleMessage}
            success={this.state.successful}
            type="update"
                        />
                    </div>
                </Modal>
            </div>
        );
    }
}
