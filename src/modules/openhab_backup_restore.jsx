import React from "react";
import Modal from "../components/modal.jsx";
import ActionGroup from "../components/action-group.jsx";
import { getInstalledopenHAB, getopenHABBackups, getopenHABBackupDir } from "../functions/openhab.js";
import { sendCommand } from "../functions/cockpit.js";
import ConfigurationDialog from "../components/configuration-dialog.jsx";
import { DropdownItem } from '@patternfly/react-core';

import "../custom.scss";
import "../patternfly.scss";
import "core-js/stable";
import "regenerator-runtime/runtime";

export default class OHBackupRestore extends React.Component {
    getDetails() {
        getInstalledopenHAB().then((data) => { this.setState({ openhab: data }) });
        this.buildTable();
    }

    // builds the table with all backups
    async buildTable() {
        var backups = await getopenHABBackups();
        if (backups !== undefined) {
            this.loadTable(backups);
        } else {
            this.setState({ tableContent: <label>No backups available</label> });
        }
    }

    // create the table structure
    loadTable(backups) {
        var result = [];
        backups.forEach((backup) => {
            result.push(
                <tr>
                    <td>{backup.date.toLocaleString()}</td>
                    <td>{backup.size}</td>
                    <td>{this.getActionItemGroup(backup.name)}</td>
                </tr>
            );
        });
        this.setState({ backupTable : result });
    }

    // returns an action item object for this row
    getActionItemGroup(name) {
        return (
            <ActionGroup
position="right" dropdownItems={[
    <DropdownItem
                    key="delete" onClick={(e) => {
                        this.handleDelete(name);
                    }}
    >
        Delete
    </DropdownItem>,
    <DropdownItem
                    key="download" onClick={(e) => {
                        this.handleDownload(name);
                    }}
    >
        Download
    </DropdownItem>,
    <DropdownItem
                    key="restore" onClick={(e) => {
                        this.handleRestore(name);
                    }}
    >
        Restore
    </DropdownItem>,
]}
            />
        );
    }

    async createBackup(name) {
        this.setState({ showMenu: false, disableModalClose: true });
        var data = await sendCommand(["./openhab-backup-restore.sh", "backup"], "/opt/openhab-cockpit/src/scripts");
        if (data.toLowerCase().includes("error") || data.toLowerCase().includes("failed")) {
            this.configFailure(data);
        } else {
            this.configSuccesful(data);
        }
        this.buildTable();
    }

    async restoreBackup(name) {
        this.setState({ showMenu: false, disableModalClose: true });
        var data = await sendCommand(["./openhab-backup-restore.sh", "restore", (await getopenHABBackupDir()) + "/" + name], "/opt/openhab-cockpit/src/scripts");
        if (data.toLowerCase().includes("error") || data.toLowerCase().includes("failed")) {
            this.configFailure(data);
        } else {
            this.configSuccesful(data);
        }
    }

    async deleteBackup(name) {
        console.log("deleting openHAB backup '" + name + "'.");
        await sendCommand(["rm", "-f", name], await getopenHABBackupDir());
        this.buildTable();
    }

    // will be called if was succesfull
    configSuccesful(data) {
        console.log("openHAB restore succesful.\n" + data);
        this.setState({
            showResult: true,
            consoleMessage: data,
            successful: true,
            disableModalClose: false,
        });
    }

    // will be called if failed
    configFailure(data) {
        var message =
      "Error could not restore openHAB backup. Output: \n" +
      data;
        console.error(message);
        this.setState({
            showResult: true,
            successful: false,
            consoleMessage: message,
            disableModalClose: false,
        });
    }

    constructor(props) {
        super(props);
        this.state = {
            backupTable: <tr />,
            showMenu: true,
            show: true,
            successful: true,
            showResult: false,
            consoleMessage: "Update done. Please reload the page to see them.",
            disableModalClose: false,
            isOpen: false,
        };
        // handler for closing the modal
        this.handleClose = (e) => {
            if (!this.state.disableModalClose)
                this.props.onClose && this.props.onClose(e);
        };
        this.handleDownload = (e) => {
            console.log("juhu");
            console.log(e);
        };
        this.handleDelete = (e) => {
            this.deleteBackup(e);
        };
        this.handleRestore = (e) => {
            this.restoreBackup(e);
        };
    }

    componentDidMount() {
        this.getDetails();
    }

    componentWillUnmount() {}

    render() {
        const showMenu = this.state.showMenu
            ? "display-block"
            : "display-none";
        const showLoading = !this.state.showMenu ? "display-block" : "display-none";

        return (
            <Modal
        disableModalClose={this.state.disableModalClose}
        onClose={this.handleClose}
        show={this.state.show}
        header={this.state.openhab + " backup & restore"}
            >
                <div className={showMenu}>
                    <h4>Available backups</h4>
                    <table className="pf-c-table pf-m-grid-md pf-m-compact">
                        <thead>
                            <tr>
                                <th scope="col"><b>Date/Time</b></th>
                                <th scope="col"><b>Size</b></th>
                                <th scope="col"><b>Actions</b></th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.backupTable}
                        </tbody>
                    </table>
                    <br />
                    <div className="div-full-center">
                        <button
              className="pf-c-button pf-m-primary"
              onClick={(e) => {
                  this.createBackup();
              }}
                        >
                            Create new backup
                        </button>
                    </div>
                </div>
                <div className={showLoading}>
                    <ConfigurationDialog
            onClose={this.handleClose}
            packageName="remote console"
            showResult={this.state.showResult}
            message={this.state.consoleMessage}
            success={this.state.successful}
                    />
                </div>
            </Modal>
        );
    }
}
