import React from "react";
import cockpit from "cockpit";
import Modal from "../components/modal.jsx";
import InstallationDialog from "../components/installation-dialog.jsx";
import { Alert } from "@patternfly/react-core";

import "../custom.scss";
import "../patternfly.scss";

export default class CheckOpenHABCockpitUpdates extends React.Component {
    // checking for updates on github
    checkForUpdates() {
        var proc = cockpit.spawn(["git", "fetch", "--dry-run"], {
            superuser: "require",
            err: "out",
            directory: "/opt/openhab-cockpit",
        });
        proc.then((data) => {
            // if prcess returns empty string, no update is available
            if (data === "") {
                this.setState({
                    updatesAvailable: false,
                });
                return;
            }
            // if result containssomething an update will be available
            this.setState({ updatesAvailable: true });
        });
        proc.catch((exception, data) => {
            console.error(
                "Error while checking for openHAB-cockpit updates on github. Readed data: \n" +
          data +
          "\n\n Exception: \n" +
          exception
            );
        });
    }

    // updates the openHAB-cockpit
    update() {
        this.setState({ showMenu: false, installingUpdates: true }, () => {
            var proc = cockpit.script(
                `
                rm -r /opt/openhab-cockpit
                git clone https://github.com/flo-mic/openHAB-cockpit.git /opt/openhab-cockpit
                cd openhab-cockpit
                chmod +x src/scripts/*.sh
                mkdir -p /usr/share/cockpit/openhab
                cp -r dist/* /usr/share/cockpit/openhab
                `,
                [],
                {
                    superuser: "require",
                    err: "out",
                    directory: "/opt",
                }
            );
            proc.then((data) => {
                console.log("New updates for openHAB-cockpit installed.\n" + data);
                this.setState(
                    {
                        installingUpdates: false,
                        showResult: true,
                        consoleMessage: data,
                        successful: !(
                            data.toLowerCase().includes("error") ||
              data.toLowerCase().includes("failed")
                        ),
                    },
                    () => {
                        this.checkForUpdates();
                    }
                );
            });
            proc.catch((exception, data) => {
                var message =
          "Could not install the latest openHAB-cockpit updates. Readed data: \n" +
          data +
          "\n\n Exception: \n" +
          exception;
                console.error(message);
                this.setState({
                    installingUpdates: false,
                    showResult: true,
                    successful: false,
                    consoleMessage: message,
                });
            });
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
                        <InstallationDialog
            onClose={this.handleModalShow}
            packageName="openHAB-cockpit"
            showResult={this.state.showResult}
            message={this.state.consoleMessage}
            success={this.state.successful}
                        />
                    </div>
                </Modal>
            </div>
        );
    }
}
