import cockpit from "cockpit";
import React from "react";
import ReactDOM from "react-dom";
import {
    faCheckCircle,
    faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "../custom.scss";
import "../components/modal.scss";
import "../components/patternfly.scss";

export default class OpenHABianApplyImprovements extends React.Component {
    installPackage() {
        var message =
      "Package " + this.state.PackageDisplayName + " will be updated.";
        console.log(message);
        this.setState({ showChoiceMenu: false, installingPackage: true }, () => {
            var proc = cockpit.spawn(
                ["./openhabian-apply-improvments.sh", this.state.selectedPackage],
                {
                    superuser: "require",
                    err: "out",
                    directory: "/opt/openhab-cockpit/src/scripts",
                }
            );
            proc.then((data) => {
                console.log("Package succesfully updated See Result:.\n" + data);
                this.setState({
                    installingPackage: false,
                    showFinalDialog: true,
                    showSuccessIcon: !(
                        data.toLowerCase().includes("error") ||
            data.toLowerCase().includes("failed")
                    ),
                    resultMessage:
            "Installation of package " +
            this.state.PackageDisplayName +
            " done. Logs are stored in the browser console if you need them.",
                });
            });
            proc.catch((exception, data) => {
                var message =
          "Could not install the package '" +
          this.state.PackageDisplayName +
          "'. Output: \n" +
          data +
          "\n\n Exception: \n" +
          exception;
                console.error(message);
                this.setState({
                    installingPackage: false,
                    showFinalDialog: true,
                    showSuccessIcon: false,
                    resultMessage: message,
                });
            });
        });
    }

    // returns to package selection on back button press
    backToMenuSelection() {
        this.setState({
            installingPackage: false,
            showFinalDialog: false,
            showChoiceMenu: true,
        });
    }

    // Resets all selection elements. important for interactiv gui
    resetSelection() {
        this.setState({
            packageSystemPackages: false,
            packageBashVim: false,
            packageSystemTweaks: false,
            packagePermissions: false,
            packageFireMotD: false,
            packageSamba: false,
        });
    }

    constructor() {
        super();
        this.state = {
            showChoiceMenu: true,
            installingPackage: false,
            showFinalDialog: false,
            showSuccessIcon: true,
            resultMessage: "",
            packageSystemPackages: true,
            packageBashVim: false,
            packageSystemTweaks: false,
            packagePermissions: false,
            packageFireMotD: false,
            packageSamba: false,
            selectedPackage: "packageSystemPackages",
            PackageDisplayName: "System Packages",
        };

        this.handleSelectionChange = (e) => {
            this.resetSelection();
            if (e === "packageSystemPackages")
                this.setState({
                    packageSystemPackages: true,
                    selectedPackage: "packageSystemPackages",
                    PackageDisplayName: "System Packages",
                });
            if (e === "packageBashVim")
                this.setState({
                    packageBashVim: true,
                    selectedPackage: "packageBashVim",
                    PackageDisplayName: "Bash & Vim",
                });
            if (e === "packageSystemTweaks")
                this.setState({
                    packageSystemTweaks: true,
                    selectedPackage: "packageSystemTweaks",
                    PackageDisplayName: "System Tweaks",
                });
            if (e === "packagePermissions")
                this.setState({
                    packagePermissions: true,
                    selectedPackage: "packagePermissions",
                    PackageDisplayName: "Fix-Permissions",
                });
            if (e === "packageFireMotD")
                this.setState({
                    packageFireMotD: true,
                    selectedPackage: "packageFireMotD",
                    PackageDisplayName: "FireMotD",
                });
            if (e === "packageSamba")
                this.setState({
                    packageSamba: true,
                    selectedPackage: "packageSamba",
                    PackageDisplayName: "Samba share",
                });
        };

        // handler for closing the modal
        this.onClose = (e) => {
            if (!this.state.installingPackage)
                this.props.onClose && this.props.onClose(e);
        };

        this.handleClickOutsideModal = (e) => {
            const domNode = ReactDOM.findDOMNode(this.state.node);
            if (!domNode.contains(e.target)) this.onClose(e);
        };

        this.handleModalEscKeyEvent = (e) => {
            if (e.keyCode == 27) this.onClose(e);
        };
    }

    componentDidMount() {
        document.addEventListener("click", this.handleClickOutsideModal, false);
        document.addEventListener("keydown", this.handleModalEscKeyEvent, false);
    }

    componentWillUnmount() {
        document.removeEventListener("click", this.handleClickOutsideModal, false);
        document.removeEventListener("keydown", this.handleModalEscKeyEvent, false);
    }

    render() {
        const showInstallingSpinner = this.state.installingPackage
            ? "display-block"
            : "display-none";

        const showDoneMessage = this.state.showFinalDialog
            ? "display-block"
            : "display-none";

        const showChoiceMenu = this.state.showChoiceMenu
            ? "display-block"
            : "display-none";

        const displaySuccess = this.state.showSuccessIcon
            ? "display-block fa-5x success-icon"
            : "display-none";

        const displayError = this.state.showSuccessIcon
            ? "display-none"
            : "display-block fa-5x failure-icon";

        return (
            <div>
                <div className="modal-backdrop in" />
                <div className="modal-container in">
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
                                        <h4 className="modal-title">Apply Improvements</h4>
                                    </div>
                                    <div>
                                        <button
                      className="pf-c-button close-button"
                      type="button"
                      onClick={(e) => {
                          this.onClose(e);
                      }}
                                        >
                                            X
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-body scroll">
                                <div className={showChoiceMenu}>
                                    <div className="padding-vertical">
                                        <div className="pf-c-radio">
                                            <input
                        className="pf-c-radio__input margin-top"
                        type="radio"
                        onClick={(e) => {
                            this.handleSelectionChange("packageSystemPackages");
                        }}
                        onChange={(e) => {
                            this.handleNothing();
                        }}
                        checked={this.state.packageSystemPackages}
                                            />
                                            <label
                        onClick={(e) => {
                            this.handleSelectionChange("packageSystemPackages");
                        }}
                        className="pf-c-radio__label radio-item"
                                            >
                                                <b>System packages</b> - Install needed and recomended
                                                system packages on your system.
                                            </label>
                                        </div>
                                    </div>
                                    <div className="padding-vertical">
                                        <div className="pf-c-radio">
                                            <input
                        className="pf-c-radio__input margin-top"
                        type="radio"
                        onClick={(e) => {
                            this.handleSelectionChange("packageBashVim");
                        }}
                        onChange={(e) => {
                            this.handleNothing();
                        }}
                        checked={this.state.packageBashVim}
                                            />
                                            <label
                        onClick={(e) => {
                            this.handleSelectionChange("packageBashVim");
                        }}
                        className="pf-c-radio__label radio-item"
                                            >
                                                <b>Bash & VIM</b> - Updates customized openHABian
                                                settings for bash, vim and nano.
                                            </label>
                                        </div>
                                    </div>
                                    <div className="padding-vertical">
                                        <div className="pf-c-radio">
                                            <input
                        className="pf-c-radio__input margin-top"
                        type="radio"
                        onClick={(e) => {
                            this.handleSelectionChange("packageSystemTweaks");
                        }}
                        onChange={(e) => {
                            this.handleNothing();
                        }}
                        checked={this.state.packageSystemTweaks}
                                            />
                                            <label
                        onClick={(e) => {
                            this.handleSelectionChange("packageSystemTweaks");
                        }}
                        className="pf-c-radio__label radio-item"
                                            >
                                                <b>System Tweaks</b> - Adds /srv mounts and updates
                                                settings that are typicaly for openHAB.
                                            </label>
                                        </div>
                                    </div>
                                    <div className="padding-vertical">
                                        <div className="pf-c-radio">
                                            <input
                        className="pf-c-radio__input margin-top"
                        type="radio"
                        onClick={(e) => {
                            this.handleSelectionChange("packagePermissions");
                        }}
                        onChange={(e) => {
                            this.handleNothing();
                        }}
                        checked={this.state.packagePermissions}
                                            />
                                            <label
                        onClick={(e) => {
                            this.handleSelectionChange("packagePermissions");
                        }}
                        className="pf-c-radio__label radio-item"
                                            >
                                                <b>Fix Permissions</b> - Update file permissions of
                                                commonly used files and folders.
                                            </label>
                                        </div>
                                    </div>
                                    <div className="padding-vertical">
                                        <div className="pf-c-radio">
                                            <input
                        className="pf-c-radio__input margin-top"
                        type="radio"
                        onClick={(e) => {
                            this.handleSelectionChange("packageFireMotD");
                        }}
                        onChange={(e) => {
                            this.handleNothing();
                        }}
                        checked={this.state.packageFireMotD}
                                            />
                                            <label
                        onClick={(e) => {
                            this.handleSelectionChange("packageFireMotD");
                        }}
                        className="pf-c-radio__label radio-item"
                                            >
                                                <b>FireMotD</b> - Upgrade the program behind the system
                                                overview on SSH login.
                                            </label>
                                        </div>
                                    </div>
                                    <div className="padding-vertical">
                                        <div className="pf-c-radio">
                                            <input
                        className="pf-c-radio__input margin-top"
                        type="radio"
                        onClick={(e) => {
                            this.handleSelectionChange("packageSamba");
                        }}
                        onChange={(e) => {
                            this.handleNothing();
                        }}
                        checked={this.state.packageSamba}
                                            />
                                            <label
                        onClick={(e) => {
                            this.handleSelectionChange("packageSamba");
                        }}
                        className="pf-c-radio__label radio-item"
                                            >
                                                <b>Samba shares</b> - Install the Samba file sharing
                                                service and set up openHAB shares.
                                            </label>
                                        </div>
                                    </div>
                                    <div
                    style={{ paddingTop: "0.5rem" }}
                    className="div-full-center"
                                    >
                                        <button
                      style={{ paddingTop: "0.5rem" }}
                      className="pf-c-button pf-m-primary"
                      onClick={(e) => {
                          this.installPackage();
                      }}
                                        >
                                            Install
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
                                    <div
                    style={{ paddingTop: "0.5rem" }}
                    className="div-full-center"
                                    >
                                        <button
                      className="pf-c-button pf-m-primary"
                      onClick={(e) => {
                          this.backToMenuSelection();
                      }}
                                        >
                                            Back
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
