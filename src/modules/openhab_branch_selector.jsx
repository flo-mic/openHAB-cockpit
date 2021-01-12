import React from "react";
import cockpit from "cockpit";
import RadioBox from "../components/radio-box.jsx";
import Modal from "../components/modal.jsx";
import InstallationDialog from "../components/installation-dialog.jsx";

import "../custom.scss";
import "../patternfly.scss";

export default class OHBranchSelector extends React.Component {
    // Start the installation with update button. Selects the defined branche
    updateBranche() {
        // check for valid oh version to avoid unexpected downgrade
        if (this.props.openhab !== "openHAB3" && this.props.openhab !== "openHAB2") {
            console.error("detected openHAB version was not properly detected. Can not run the branch update");
            return;
        }
        if (this.state.branchRelease === true) {
            this.installScript(this.props.openhab, "stable");
        }
        if (this.state.branchTesting === true) {
            this.installScript(this.props.openhab, "testing");
        }
        if (this.state.branchSnapshot === true) {
            this.installScript(this.props.openhab, "unstable");
        }
    }

    installScript(openhab, branch) {
        this.setState({ showMenu: false, disableModalClose: true, brancheToInstall: branch });
        console.log("Installation of '" + openhab + "' branch '" + branch + "' started.");
        var proc = cockpit.spawn(["./openhab-setup.sh", openhab, branch], {
            superuser: "require",
            err: "out",
            directory: "/opt/openhab-cockpit/src/scripts",
        });
        proc.then((data) => {
            this.setState({
                consoleMessage: data,
                disableModalClose: false,
                showResult: true,
                successful: !(
                    data.toLowerCase().includes("error") ||
          data.toLowerCase().includes("failed")
                ),
            });
            console.log("installation of '" + openhab + "' branch '" + branch + "' done. Output: \n" + data);
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
                successful: false,
                disableModalClose: false,
                showResult: true,
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
        });
    }

    // Resets the radio checkbox on nes selection
    resetSelection() {
        this.setState({
            branchRelease: false,
            branchTesting: false,
            branchSnapshot: false,
        });
    }

    constructor() {
        super();
        this.state = {
            show: true,
            branchRelease: false,
            branchTesting: false,
            branchSnapshot: false,
            repo: "",
            brancheToInstall: "",
            showMenu: true,
            showResult: false,
            successful: false,
            consoleMessage: "",
            disableModalClose: false,
        };

        // handler for closing the modal
        this.handleClose = (e) => {
            if (!this.state.disableModalClose)
                this.props.onClose && this.props.onClose(e);
        };

        // Sets the repo to be used
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
        const showMenuDialog = this.state.showMenu
            ? "display-block"
            : "display-none";

        const showInstallDialog = !this.state.showMenu
            ? "display-block"
            : "display-none";

        return (
            <Modal
        disableModalClose={this.state.disableModalClose}
        onClose={this.handleClose}
        show={this.state.show}
        header={this.props.openhab + " branches"}
            >
                <div className={showMenuDialog}>
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
                  this.updateBranche();
              }}
                        >
                            Update
                        </button>
                    </div>
                </div>
                <div className={showInstallDialog}>
                    <InstallationDialog
            onClose={this.handleClose}
            packageName={this.props.openhab + " (" + this.state.brancheToInstall + ")"}
            showResult={this.state.showResult}
            message={this.state.consoleMessage}
            success={this.state.successful}
                    />
                </div>
            </Modal>
        );
    }
}
