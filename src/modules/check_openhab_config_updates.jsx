import React from "react";
import cockpit from "cockpit";
import ReactDOM from "react-dom";
import { Alert } from "@patternfly/react-core";
import {
    faCheckCircle,
    faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "../custom.scss";
import "../components/modal.scss";
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
        this.setState({ showUpdateButton: false, installingUpdates: true }, () => {
            var proc = cockpit.script(`
                rm -r /opt/openhab-cockpit
                git clone https://github.com/flo-mic/openHAB-cockpit.git /opt/openhab-cockpit
                cd openhab-cockpit
                chmod +x src/scripts/*.sh
                mkdir -p /usr/share/cockpit/openhab
                cp -r dist/* /usr/share/cockpit/openhab
                `, [], {
                superuser: "require",
                err: "out",
                directory: "/opt",
            });
            proc.then((data) => {
                console.log("New updates for openHAB-cockpit installed.\n" + data);
                this.setState(
                    {
                        installingUpdates: false,
                        showFinalDialog: true,
                        showSuccessIcon: !(data.toLowerCase().includes("error") || data.toLowerCase().includes("failed")),
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
                    showFinalDialog: true,
                    showSuccessIcon: false,
                    resultMessage: message,
                });
            });
        });
    }

    constructor() {
        super();
        this.state = {
            updatesAvailable: false,
            installingUpdates: false,
            showFinalDialog: false,
            showSuccessIcon: true,
            showUpdateButton: true,
            showModal: false,
            resultMessage: "Update done. Please reload the page to see them.",
        };
        this.handleModalShow = (e) => {
            if (this.state.showModal == true) {
                document.removeEventListener(
                    "click",
                    this.handleClickOutsideModal,
                    false
                );
                document.removeEventListener(
                    "keydown",
                    this.handleModalEscKeyEvent,
                    false
                );
            } else {
                document.addEventListener("click", this.handleClickOutsideModal, false);
                document.addEventListener(
                    "keydown",
                    this.handleModalEscKeyEvent,
                    false
                );
            }
            this.setState({
                showModal: !this.state.showModal,
            });
        };
        this.handleClickOutsideModal = (e) => {
            const domNode = ReactDOM.findDOMNode(this.state.node);
            if (!domNode.contains(e.target)) this.handleModalShow(e);
        };
        this.handleModalEscKeyEvent = (e) => {
            if (e.keyCode == 27) this.handleModalShow(e);
        };
    }

    componentDidMount() {
        this.checkForUpdates();
    }

    componentWillUnmount() {
        document.removeEventListener("click", this.handleClickOutsideModal, false);
        document.removeEventListener("keydown", this.handleModalEscKeyEvent, false);
    }

    render() {
        const showUpdatesAvailable = this.state.updatesAvailable
            ? "display-block"
            : "display-none";

        const showInstallingSpinner = this.state.installingUpdates
            ? "display-block"
            : "display-none";

        const showHideBackground = this.state.showModal
            ? "modal-backdrop in"
            : "display-none";

        const showHideModal = this.state.showModal
            ? "modal-container in"
            : "modal display-none";

        const showDoneMessage = this.state.showFinalDialog
            ? "display-block"
            : "display-none";

        const hideUpdateButton = !this.state.showUpdateButton
            ? "display-none"
            : "display-block";

        const displaySuccess = this.state.showSuccessIcon
            ? "display-block fa-5x success-icon"
            : "display-none";

        const displayError = this.state.showSuccessIcon
            ? "display-none"
            : "display-block fa-5x failure-icon";

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
                <div className={showHideBackground} />
                <div className={showHideModal}>
                    <div className="modal-dialog">
                        <div
              className="modal-content"
              ref={(node) => {
                  this.state.node = node;
              }}
                        >
                            <div className="modal-header">
                                <div className="justify-content-space-between">
                                    <div>
                                        <h4 className="modal-title">Update openHAB-cockpit</h4>
                                    </div>
                                    <div>
                                        <button
                      className="pf-c-button close-button"
                      type="button"
                      onClick={(e) => {
                          this.handleModalShow(e);
                      }}
                                        >
                                            X
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-body scroll">
                                <div className={hideUpdateButton}>
                                    <div
                    style={{ paddingTop: "0.5rem" }}
                    className="div-full-center"
                                    >
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
                                <div className={showInstallingSpinner}>
                                    <div className="display-flex-center">
                                        <h3 className="display-flex-center-body">
                                            installation running...
                                        </h3>
                                    </div>
                                    <div className="display-flex-center">
                                        <div className="display-flex-center-body">
                                            <span
                        className="pf-c-spinner"
                        role="progressbar"
                        aria-valuetext="Loading..."
                                            >
                                                <span className="pf-c-spinner__clipper" />
                                                <span className="pf-c-spinner__lead-ball" />
                                                <span className="pf-c-spinner__tail-ball" />
                                            </span>
                                        </div>
                                    </div>
                                    <div className="display-flex-center">
                                        <p className="display-flex-center-body">
                                            This installation will need some time, please wait.
                                        </p>
                                    </div>
                                </div>
                                <div className={showDoneMessage}>
                                    <div className="div-full-center">
                                        <FontAwesomeIcon
                      className={displaySuccess}
                      icon={faCheckCircle}
                                        />
                                        <FontAwesomeIcon
                      className={displayError}
                      icon={faExclamationCircle}
                                        />
                                    </div>
                                    <div
                    style={{ paddingTop: "0.5rem", paddingBottom: "0.5rem" }}
                    className="div-full-center"
                                    >
                                        <p>{this.state.resultMessage}</p>
                                    </div>
                                    <br />
                                    <div
                    className="div-full-center"
                                    >
                                        <button
                      className="pf-c-button pf-m-primary"
                      onClick={(e) => {
                          this.handleModalShow();
                      }}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
