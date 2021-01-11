import React from "react";
import cockpit from "cockpit";
import { faCheckCircle, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "../custom.scss";
import "../components/modal.scss";
import "../components/patternfly.scss";

export default class OHBranchSelector extends React.Component {
    constructor() {
        super();
        this.state = {
            branchRelease: false,
            branchTesting: false,
            branchSnapshot: false,
            repo: "",
            showLoading: false,
            showBranchSelector: true,
            showInstallationDone: false,
            message: "",
            changeSuccesfull: true,
        };
        this.handleSelectionChange = (e) => {
            this.resetSelection();
            if (e === "release")
                this.setState({
                    branchRelease: true,
                    repo: "deb https://dl.bintray.com/openhab/apt-repo2 stable main",
                });
            if (e === "testing")
                this.setState({
                    branchTesting: true,
                    repo:
            "deb https://openhab.jfrog.io/artifactory/openhab-linuxpkg testing main",
                });
            if (e === "snapshot")
                this.setState({
                    branchSnapshot: true,
                    repo:
            "deb https://openhab.jfrog.io/artifactory/openhab-linuxpkg unstable main",
                });
        };
        this.onDisableModalClose = (e) => {
            this.props.onDisableModalClose && this.props.onDisableModalClose(e);
        };
        this.handleNothing = (e) => {};
        this.showOutput = (e) => {
            this.setState({ showOutput: !this.state.showOutput });
        };
        this.handleBranchUpdate = (e) => {
            if (this.state.branchRelease === true) {
                this.installScript(this.props.openhab, "stable");
            }
            if (this.state.branchTesting === true) {
                this.installScript(this.props.openhab, "testing");
            }
            if (this.state.branchSnapshot === true) {
                this.installScript(this.props.openhab, "unstable");
            }
        };
    }

    installScript(openhab, branch) {
        this.onDisableModalClose();
        this.setState({ showLoading: true, showBranchSelector: false });
        var proc = cockpit.spawn(["./openhab-setup.sh", openhab, branch], {
            superuser: "require",
            err: "out",
            directory: "/opt/openhab-cockpit/src/scripts",
        });
        proc.then((data) => {
            this.setState({ message: data, changeSuccesfull: !data.includes("Error") });
            this.openInstallationDone();
        });
        proc.catch((exception, data) => {
            console.error("Error while installing " + openhab + " from branch (" + branch + ").\nException: " + exception + "\n\nOutput: " + data);
            this.setState({ changeSuccesfull: false, message: "Error while installing " + openhab + " from branch (" + branch + ").\nException:" + exception + "\n\nOutput:" + data });
            this.openInstallationDone();
        });
    }

    openInstallationDone() {
        this.setState({ showInstallationDone: true, showLoading: false });
        this.onDisableModalClose();
    }

    resetSelection() {
        this.setState({
            branchRelease: false,
            branchTesting: false,
            branchSnapshot: false,
        });
    }

    /* Runs when component is build */
    componentDidMount() {
        this.resetSelection();
        if (this.props.branch === "release") this.setState({ branchRelease: true });
        if (this.props.branch === "testing") this.setState({ branchTesting: true });
        if (this.props.branch === "snapshot") this.setState({ branchSnapshot: true });
    }

    render() {
        const showInstallingSpinner = this.state.showLoading
            ? "display-block"
            : "display-none";
        const installationDone = this.state.showInstallationDone
            ? "display-block"
            : "display-none";
        const showBranchSelectorDialog = this.state.showBranchSelector
            ? "display-block"
            : "display-none";
        const showOutput = this.state.showOutput
            ? " display-block console-text"
            : "display-none";

        const displaySuccess = this.state.changeSuccesfull
            ? "display-block fa-5x success-icon"
            : "display-none";

        const displayError = this.state.changeSuccesfull
            ? "display-none"
            : "display-block fa-5x failure-icon";

        return (
            <div>
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
                <div className={installationDone}>
                    <div className="display-flex-center">
                        <h3 className="display-flex-center-body">
                            installation done.
                        </h3>
                    </div>
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
                    <div className="display-flex-center">
                        <div className="display-flex-center-body">
                            <button
                className="pf-c-button pf-m-primary"
                onClick={(e) => {
                    this.showOutput();
                }}
                            >
                                Show install messages
                            </button>

                        </div>
                    </div>
                    <div className="display-flex-center">
                        <div className="display-flex-center-body"><p className={showOutput}>{this.state.message}</p>
                        </div>
                    </div>
                </div>
                <div className={showBranchSelectorDialog}>
                    <div className="padding-vertical">
                        <div className="pf-c-radio">
                            <input
              className="pf-c-radio__input margin-top"
              type="radio"
              onClick={(e) => {
                  this.handleSelectionChange("release");
              }}
              onChange={(e) => {
                  this.handleNothing();
              }}
              checked={this.state.branchRelease}
                            />
                            <label
              onClick={(e) => {
                  this.handleSelectionChange("release");
              }}
              className="pf-c-radio__label radio-item"
              htmlFor="radio-simple"
                            >
                                <b>release</b> - Install or switch to the latest openHAB release.
                                Use thisfor your productive environment.
                            </label>
                        </div>
                    </div>
                    <div className="padding-vertical">
                        <div className="pf-c-radio">
                            <input
              className="pf-c-radio__input"
              type="radio"
              onClick={(e) => {
                  this.handleSelectionChange("testing");
              }}
              onChange={(e) => {
                  this.handleNothing();
              }}
              checked={this.state.branchTesting}
                            />
                            <label
              onClick={(e) => {
                  this.handleSelectionChange("testing");
              }}
              className="pf-c-radio__label radio-item"
              htmlFor="radio-simple"
                            >
                                <b>testing</b> - Install or switch to the latest openHAB testing
                                build. This is only recomended for testing.
                            </label>
                        </div>
                    </div>
                    <div className="padding-vertical">
                        <div className="pf-c-radio">
                            <input
              className="pf-c-radio__input"
              type="radio"
              onClick={(e) => {
                  this.handleSelectionChange("snapshot");
              }}
              onChange={(e) => {
                  this.handleNothing();
              }}
              checked={this.state.branchSnapshot}
                            />
                            <label
              onClick={(e) => {
                  this.handleSelectionChange("snapshot");
              }}
              className="pf-c-radio__label radio-item"
              htmlFor="radio-simple"
                            >
                                <b>snapshot</b> - Install or switch to the latest openHAB
                                snapshot. Snapshots contain the latest changes and therefore they
                                are not stable. Use them only for testing!
                            </label>
                        </div>
                    </div>
                    <br />
                    <div className="div-full-center">
                        <button
                className="pf-c-button pf-m-primary"
                onClick={(e) => {
                    this.handleBranchUpdate();
                }}
                        >
                            Update
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}
