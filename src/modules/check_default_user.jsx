import React from "react";
import cockpit from "cockpit";
import ReactDOM from "react-dom";
import { Alert, TextInput } from "@patternfly/react-core";

import "../custom.scss";
import "../components/modal.scss";
import "../components/patternfly.scss";

export default class CheckDefaultUser extends React.Component {
    checkForDefaultPassword() {
        var proc = cockpit.spawn(["./checkDefaultUserPassword.sh"], {
            superuser: "require",
            err: "out",
            directory: "/usr/share/cockpit/openhab/scripts",
        });
        proc.then((data) => {
            if (data.includes("Default password detected!.")) {
                this.setState({
                    defaultPasswordChanged: false,
                    defaultUser: data.split("(")[1].split(")")[0],
                });
                return;
            }
            // this.setState({ defaultPasswordChanged: true });
            this.setState({ defaultPasswordChanged: true });
        });
        proc.catch((exception, data) => {
            console.error(
                "Error while verifying the default openhabian/pi password. Readed data: \n" +
          data +
          "\n\n Exception: \n" +
          exception
            );
        });
    }

    setPassword() {
        if (
            this.state.newPassword !== "" &&
      this.state.newPassword === this.state.confirmNewPassword
        ) {
            this.setState({ displayInvalidPasswordMessage: "display-none" });
            this.cmdChangePassword();
        } else {
            this.setState({
                displayInvalidPasswordMessage: "display-block div-full-center",
            });
        }
    }

    cmdChangePassword() {
        var proc = cockpit.spawn(
            [
                "./changeDefaultPassword.sh",
                this.state.defaultUser,
                this.state.newPassword,
            ],
            {
                superuser: "require",
                err: "out",
                directory: "/usr/share/cockpit/openhab/scripts",
            }
        );
        proc.then((data) => {
            console.log("Password updated.\n" + data);
            this.setState({
                bodyModal: (
                    <div style={{ padding: "1.5rem" }} className="div-full-center">
                        <h3>Password changed.</h3>
                    </div>
                ),
            });
        });
        proc.catch((exception, data) => {
            console.error(
                "Could not change the default password of user '" +
          this.state.defaultUser +
          "'. Readed data: \n" +
          data +
          "\n\n Exception: \n" +
          exception
            );
        });
    }

    set_event_Handler() {
        if (this.props.showModal) {
            document.addEventListener("click", this.handleClickOutsideModal, false);
            document.addEventListener("keydown", this.handleModalEscKeyEvent, false);
            this.setState({ prevStateShow: this.props.showModal });
        } else {
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
            this.setState({ prevStateShow: this.props.show });
        }
    }

    constructor() {
        super();
        this.state = {
            defaultPasswordChanged: true,
            showModal: false,
            headerModal: <div />,
            bodyModal: <div />,
            defaultUser: "openhabian",
            newPassword: "",
            confirmNewPassword: "",
            displayInvalidPasswordMessage: "display-none",
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
        this.handleNewPasswordText = (e) => {
            this.setState({
                newPassword: e,
            });
        };
        this.handleConfirmNewPasswordText = (e) => {
            this.setState({
                confirmNewPassword: e,
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
        this.checkForDefaultPassword();
    }

    render() {
        const showDefaultPasswordWarning = this.state.defaultPasswordChanged
            ? "display-none"
            : "display-block";

        const showHideBackground = this.state.showModal
            ? "modal-backdrop in"
            : "display-none";

        const showHideModal = this.state.showModal
            ? "modal-container in"
            : "modal display-none";

        return (
            <div>
                <div className={showDefaultPasswordWarning}>
                    <Alert
            isInline
            variant="danger"
            title="Default password not changed!"
                    >
                        <p>
                            Running your raspberry pi with the default password of{" "}
                            {this.state.defaultUser} is a security risk and should not be
                            done.{" "}
                            <a
                onClick={(e) => {
                    this.handleModalShow();
                }}
                            >
                                You can change the password here
                            </a>
                        </p>
                    </Alert>
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
                                            <h4 className="modal-title">
                                                Change user password of {this.state.defaultUser}
                                            </h4>
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
                                    <div>
                                        <div className="div-full-center">
                                            <div style={{ Top: "0.5rem" }}>
                                                <label style={{ width: "90px" }}>password:</label>
                                                <TextInput
                          style={{ display: "inline-block", width: "200px" }}
                          value={this.state.newPassword}
                          type="text"
                          id="newpassword"
                          onChange={this.handleNewPasswordText}
                                                />
                                            </div>
                                        </div>
                                        <div className="div-full-center">
                                            <div style={{ Top: "0.5rem" }}>
                                                <label style={{ width: "90px" }}>confirm:</label>
                                                <TextInput
                          style={{ display: "inline-block", width: "200px" }}
                          value={this.state.confirmNewPassword}
                          type="text"
                          id="confirmpassword"
                          onChange={this.handleConfirmNewPasswordText}
                                                />
                                            </div>
                                        </div>
                                        <div className={this.state.displayInvalidPasswordMessage}>
                                            <label style={{ padding: "0.5rem", color: "red" }}>
                                                Passwords did not match!
                                            </label>
                                        </div>
                                        <div className="div-full-center">
                                            <button
style={{ paddingTop: "0.5rem" }}
                        className="pf-c-button pf-m-primary"
                        onClick={(e) => {
                            this.setPassword();
                        }}
                                            >
                                                Set password
                                            </button>
                                        </div>
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
