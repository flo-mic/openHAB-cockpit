import cockpit from "cockpit";
import React from "react";
import Dropdown from "../components/dropdown.jsx";

import "../custom.scss";
import "../patternfly.scss";

export default class OHServiceDetails extends React.Component {
    refreshService() {
        var proc = cockpit.spawn(["systemctl", "status", this.getServiceName()]);
        proc.stream((data) => {
            this.setState({ message: data });
        });
    }

    sendCommand(command) {
        var proc = cockpit.spawn(["systemctl", command, this.getServiceName()], {
            superuser: "try",
            err: "out",
        });
        proc
                .stream((data) => {})
                .fail(function (ex) {
                    var err =
          'The following error occoured while running this command. \nCommand: "systemctl ' +
          command +
          ' openhab service.\n"' +
          ex;
                    console.error(err);
                });
    }

    getServiceName() {
        if (this.props.openhab === "openHAB2") {
            return "openhab2";
        }
        return "openhab";
    }

    constructor() {
        super();
        this.state = {
            message: "-",
            showDropdown: false,
        };
        this.handleDropdown = (e) => {
            this.setState({
                showDropdown: !this.state.showDropdown,
            });
        };
        this.handleServiceCommand = (command) => {
            this.setState({
                showDropdown: false,
            });
            this.sendCommand(command);
        };
    }

    /* Runs when component is build */
    componentDidMount() {
        this.refreshService();
        this.interval = setInterval(() => this.refreshService(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        return (
            <div>
                <div className="display-flex-justify-space-between">
                    <h4>Status: </h4>
                    <div className="display-flex">
                        <Dropdown
              label="Restart"
              value="restart"
              onSelect={this.handleServiceCommand}
                        >
                            <li>
                                <button
                  onClick={(e) => {
                      this.handleServiceCommand("start");
                  }}
                  className="dropdown-item pf-c-button"
                  type="button"
                                >
                                    Start
                                </button>
                            </li>
                            <li>
                                <button
                  onClick={(e) => {
                      this.handleServiceCommand("stop");
                  }}
                  className="dropdown-item pf-c-button"
                  type="button"
                                >
                                    Stop
                                </button>
                            </li>
                            <li>
                                <button
                  onClick={(e) => {
                      this.handleServiceCommand("restart");
                  }}
                  className="dropdown-item pf-c-button"
                  type="button"
                                >
                                    Restart
                                </button>
                            </li>
                        </Dropdown>
                    </div>
                </div>
                <div className="padding-top">
                    <p className="console-text">{this.state.message}</p>
                </div>
            </div>
        );
    }
}
