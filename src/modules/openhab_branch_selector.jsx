import React from "react";
import RadioBox from "../components/radio-box.jsx";
import Modal from "../components/modal.jsx";
import InstallationDialog from "../components/installation-dialog.jsx";
import { getInstalledopenHAB, getopenHABBranch, installopenHAB } from "../functions/openhab.js";

import "../custom.scss";
import "../patternfly.scss";
import "core-js/stable";
import "regenerator-runtime/runtime";

export default class OHBranchSelector extends React.Component {
    // load details for this component
    async getDetails() {
        var branch = await getopenHABBranch();
        await this.setState({
            openhab: await getInstalledopenHAB(),
            branch: branch,
        });
        this.setCurrentBranch(branch);
    }

    // Reset displayed items
    setCurrentBranch(branch) {
        this.resetSelection();
        if (branch === "release") this.setState({ branchRelease: true });
        if (branch === "testing") this.setState({ branchTesting: true });
        if (branch === "snapshot")
            this.setState({ branchSnapshot: true });
    }

    // Resets the radio checkbox on nes selection
    resetSelection() {
        this.setState({
            branchRelease: false,
            branchTesting: false,
            branchSnapshot: false,
        });
    }

    // Start the installation with update button. Selects the defined branche
    updateBranche() {
        // check for valid oh version to avoid unexpected downgrade
        if (this.state.openhab !== "openHAB3" && this.state.openhab !== "openHAB2") {
            console.error("Error openHAB version was not properly detected. Can not run the branch update");
            return;
        }
        if (this.state.branchRelease === true) {
            this.installScript("stable", "release");
        }
        if (this.state.branchTesting === true) {
            this.installScript("testing", "testing");
        }
        if (this.state.branchSnapshot === true) {
            this.installScript("unstable", "snapshot");
        }
    }

    // Installs openhab
    async installScript(branch, displayName) {
        this.setState({ showMenu: false, disableModalClose: true, brancheToInstall: displayName });
        console.log("Installation of '" + this.state.openhab + "' branch '" + displayName + "' started.");
        var data = await installopenHAB(this.state.openhab, branch);
        if (data.toLowerCase().includes("error") || data.toLowerCase().includes("failed")) {
            this.installFailure(data);
        } else {
            this.installSuccesful(data);
        }
    }

    // will be called if installation was succesfull
    installSuccesful(data) {
        console.log("installation of '" + this.state.openhab + "' branch '" + this.state.brancheToInstall + "' done. Output: \n" + data);
        this.setState({
            consoleMessage: data,
            disableModalClose: false,
            showResult: true,
            successful: !(data.toLowerCase().includes("error") || data.toLowerCase().includes("failed")),
        });
    }

    // will be called if installation failed
    installFailure(data) {
        var msg = "Error while installing " + this.state.openhab + " from branch (" + this.state.brancheToInstall + "). Output: \n" + data;
        console.error(msg);
        this.setState({
            successful: false,
            disableModalClose: false,
            showResult: true,
            consoleMessage: msg
        });
    }

    constructor() {
        super();
        this.state = {
            show: true,
            branchRelease: false,
            branchTesting: false,
            branchSnapshot: false,
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
                this.setState({ branchRelease: true });
            if (e === "testing")
                this.setState({ branchTesting: true });
            if (e === "snapshot")
                this.setState({ branchSnapshot: true });
        };
    }

    /* Runs when component is build */
    componentDidMount() {
        this.getDetails();
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
        header={this.state.openhab + " branches"}
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
            packageName={this.state.openhab + " (" + this.state.brancheToInstall + ")"}
            showResult={this.state.showResult}
            message={this.state.consoleMessage}
            success={this.state.successful}
                    />
                </div>
            </Modal>
        );
    }
}
