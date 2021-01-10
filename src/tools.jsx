import React from "react";
import LogViewer from "./modules/logviewer.jsx";
import { Card, CardBody, CardTitle } from "@patternfly/react-core";

import "./custom.scss";
import "./components/patternfly.scss";

export default class Tools extends React.Component {
    get_details() {
        this.getInstalledopenHAB();
        this.get_oh_service_status();
        this.get_oh_cli_details();
        this.get_oh_selected_branch();
    }

    constructor() {
        super();
        this.state = {
            showLogViewer: false,
            LogViewerContent: <div />,
            showModal: false,
            headerModal: <div />,
            bodyModal: <div />,
            disableModalClose: false,
        };
        /* Modal action handler start */
        this.handleModalShow = (e) => {
            if (this.state.showModal) this.get_details();
            this.setState({
                showModal: !this.state.showModal,
            });
        };
        this.handleDisableModalClose = (e) => {
            this.setState({
                disableModalClose: !this.state.disableModalClose,
            });
        };
        this.handleLogViewer = (e) => {
            if (this.state.showLogViewer == false) {
                this.setState({ showLogViewer: true, LogViewerContent: <LogViewer onClose={this.handleLogViewer} showLogViewer={this.showLogViewer} /> });
            } else {
                this.setState({ showLogViewer: false, LogViewerContent: <div /> });
            }
        };

    /* Modal action handler end */
    }

    /* Runs when component is build */
    componentDidMount() {
    }

    componentWillUnmount() {
    }

    render() {
        return (
            <Card className="system-configuration">
                <CardTitle>Tools</CardTitle>
                <CardBody>
                    <div>{this.state.LogViewerContent}</div>
                    <table className="pf-c-table pf-m-grid-md pf-m-compact">
                        <tbody>
                            <tr>
                                <td>
                                    <a
                     onClick={(e) => {
                         this.handleLogViewer();
                     }}
                                    >
                                        LogViewer
                                    </a>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </CardBody>
            </Card>
        );
    }
}
