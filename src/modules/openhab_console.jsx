import React from "react";
import Modal from "../components/modal.jsx";
import { Alert, TextInput } from "@patternfly/react-core";
import {
    faCheckCircle,
    faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "../custom.scss";
import "../patternfly.scss";

export default class OpenHABConsole extends React.Component {
    readConsoleSettings() {

    }

    constructor() {
        super();
        this.state = {
            defaultPasswordChanged: true,
            showModal: false,
            defaultUser: "openhabian",
            newPassword: "",
            confirmNewPassword: "",
            displayInvalidPassword: false,
            invalidPasswordMessage: "Passwords empty or do not match.",
            disableModalClose: false,
            showSuccessMessage: false,
            successful: true,
            resultMessage: "",
        };
        // handles the modal open and close
        this.handleModalShow = (e) => {
            this.setState({
                showModal: !this.state.showModal,
                showSuccessMessage: false,
                newPassword: "",
                confirmNewPassword: "",
                displayInvalidPassword: false
            });
        };
        // sends ui input of password field
        this.handleNewPasswordText = (e) => {
            this.setState({
                newPassword: e,
            });
        };
        // sends ui input of confirm password field
        this.handleConfirmNewPasswordText = (e) => {
            this.setState({
                confirmNewPassword: e,
            });
        };
    }

    componentDidMount() {
        this.checkForDefaultPassword();
    }

    componentWillUnmount() {}

    render() {
        const showDefaultPasswordWarning = this.state.defaultPasswordChanged
            ? "display-none"
            : "display-block";

        const showSuccessMessage = this.state.showSuccessMessage
            ? "display-block"
            : "display-none";

        const hidePasswordDialog = this.state.showSuccessMessage
            ? "display-none"
            : "display-block";

        const displayInvalidPassword = this.state.displayInvalidPassword
            ? "display-block div-full-center"
            : "display-none";

        const displaySuccess = this.state.successful
            ? "display-block fa-5x success-icon"
            : "display-none";

        const displayError = this.state.successful
            ? "display-none"
            : "display-block fa-5x failure-icon";

        return (
            <div>
                <div className={showDefaultPasswordWarning}>
                    <Alert
            isInline
            variant="danger"
            title="Default password not changed!"
                    >
                        <p>
                            Running your system with the default password of{" "}
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
                </div>
                <Modal
          disableModalClose={this.state.disableModalClose}
          onClose={this.handleModalShow}
          show={this.state.showModal}
          header={"Change user password of " + this.state.defaultUser}
                >
                    <div className={hidePasswordDialog}>
                        <div className="div-full-center">
                            <div style={{ Top: "0.5rem" }}>
                                <label style={{ width: "90px" }}>password:</label>
                                <TextInput
                  style={{ display: "inline-block", width: "200px" }}
                  value={this.state.newPassword}
                  type="password"
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
                  type="password"
                  id="confirmpassword"
                  onChange={this.handleConfirmNewPasswordText}
                                />
                            </div>
                        </div>
                        <div className={displayInvalidPassword}>
                            <label style={{ padding: "0.5rem", color: "red" }}>
                                {this.state.invalidPasswordMessage}
                            </label>
                        </div>
                        <div style={{ paddingTop: "0.5rem" }} className="div-full-center">
                            <button
                className="pf-c-button pf-m-primary"
                onClick={(e) => {
                    this.setPassword();
                }}
                            >
                                Set password
                            </button>
                        </div>
                    </div>
                    <div className={showSuccessMessage}>
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
                        <div className="div-full-center">
                            <button
                className="pf-c-button pf-m-primary"
                onClick={(e) => {
                    this.handleModalShow();
                }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        );
    }
}
