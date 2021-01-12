import React from "react";
import LogViewer from "./modules/logviewer.jsx";
import OpenHABianApplyImprovements from "./modules/openhabian_apply_improvements.jsx";
import { Card, CardBody, CardTitle } from "@patternfly/react-core";

import "./custom.scss";
import "./patternfly.scss";

export default class Tools extends React.Component {
    constructor() {
        super();
        this.state = {
            showLogViewer: false,
            showApplyImprovements: false,
            LogViewerContent: <div />,
            ApplyImprovmentsContent: <div />,
        };
        this.handleLogViewer = (e) => {
            if (this.state.showLogViewer == false) {
                this.setState({ showLogViewer: true, LogViewerContent: <LogViewer onClose={this.handleLogViewer} showLogViewer={this.showLogViewer} /> });
            } else {
                this.setState({ showLogViewer: false, LogViewerContent: <div /> });
            }
        };
        this.handleImprovements = (e) => {
            if (this.state.showApplyImprovements == false) {
                this.setState({ showApplyImprovements: true, ApplyImprovmentsContent: <OpenHABianApplyImprovements onClose={this.handleImprovements} /> });
            } else {
                this.setState({ showApplyImprovements: false, ApplyImprovmentsContent: <div /> });
            }
        };
    }

    /* Runs when component is build */
    componentDidMount() {
    }

    componentWillUnmount() {
    }

    render() {
        return (
            <Card style={{ paddingLeft: "16px" }} className="system-configuration">
                <CardTitle>Tools</CardTitle>
                <CardBody>
                    <div>{this.state.LogViewerContent}</div>
                    <div>{this.state.ApplyImprovmentsContent}</div>
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
                            <tr>
                                <td>
                                    <a
                     onClick={(e) => {
                         this.handleImprovements();
                     }}
                                    >
                                        Apply Improvements
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
