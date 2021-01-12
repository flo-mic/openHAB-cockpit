import React from "react";
import cockpit from "cockpit";
import RadioBox from "../components/radio-box.jsx";
import {
    faCheckCircle,
    faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "../custom.scss";
import "../components/modal.scss";
import "../patternfly.scss";

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
            consoleMessage: "",
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
        this.showConsoleOutput = (e) => {
            this.setState({ showConsoleOutput: !this.state.showConsoleOutput });
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
            this.setState({
                consoleMessage: data,
                changeSuccesfull: !(
                    data.toLowerCase().includes("error") ||
          data.toLowerCase().includes("failed")
                ),
            });
            this.openInstallationDone();
        });
        proc.catch((exception, data) => {
            console.error(
                "Error while installing " +
          openhab +
          " from branch (" +
          branch +
          ").\nException: " +
          exception +
          "\n\nOutput: " +
          data
            );
            this.setState({
                changeSuccesfull: false,
                consoleMessage:
          "Error while installing " +
          openhab +
          " from branch (" +
          branch +
          ").\nException:" +
          exception +
          "\n\nOutput:" +
          data,
            });
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
        if (this.props.branch === "snapshot")
            this.setState({ branchSnapshot: true });
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
        const showConsoleOutput = this.state.showConsoleOutput
            ? "display-block display-flex-center"
            : "display-none";

        const showConsoleMessageButton = !this.state.changeSuccesfull
            ? "display-block display-flex-center"
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
                        <h3 className="display-flex-center-body">Installation done.</h3>
                    </div>
                    <div className="div-full-center">
                        <FontAwesomeIcon className={displaySuccess} icon={faCheckCircle} />
                        <FontAwesomeIcon
              className={displayError}
              icon={faExclamationCircle}
                        />
                    </div>
                    <div className={showConsoleMessageButton}>
                        <button
              className="pf-c-button pf-m-primary"
              onClick={(e) => {
                  this.showConsoleOutput();
              }}
                        >
                            Show install messages
                        </button>
                    </div>
                    <div className={showConsoleOutput}>
                        <p className="console-text">{this.state.consoleMessage}</p>
                    </div>
                    <br />
                    <div className="display-flex-center">
                        <button
              className="pf-c-button pf-m-primary"
              onClick={(e) => {
                  this.showConsoleOutput();
              }}
                        >
                            Close
                        </button>
                    </div>
                </div>
                <div className={showBranchSelectorDialog}>
                    <RadioBox
            onSelect={this.handleSelectionChange}
            checked={this.state.branchRelease}
            value="release"
            content={
                <div>
                    <b>release</b> - Install or switch to the latest openHAB
                    release. Use thisfor your productive environment.
                </div>
            }
                    />
                    <RadioBox
            onSelect={this.handleSelectionChange}
            checked={this.state.branchTesting}
            value="testing"
            content={
                <div>
                    <b>testing</b> - Install or switch to the latest openHAB testing
                    build. This is only recomended for testing.
                </div>
            }
                    />
                    <RadioBox
            onSelect={this.handleSelectionChange}
            checked={this.state.branchSnapshot}
            value="snapshot"
            content={
                <div>
                    <b>snapshot</b> - Install or switch to the latest openHAB
                    snapshot. Snapshots contain the latest changes and therefore
                    they are not stable. Use them only for testing!
                </div>
            }
                    />
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
