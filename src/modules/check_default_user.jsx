import React from "react";
import cockpit from "cockpit";
import Modal from "../components/modal.jsx";
import { Alert, TextInput } from "@patternfly/react-core";
import {
    faCheckCircle,
    faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import "../custom.scss";
import "../patternfly.scss";

export default class CheckDefaultUser extends React.Component {
    // check if the system runs with default openhabian/pi password
    checkForDefaultPassword() {
        var proc = cockpit.spawn(["./checkDefaultUserPassword.sh"], {
            superuser: "require",
            err: "out",
            directory: "/opt/openhab-cockpit/src/scripts",
        });
        proc.then((data) => {
            if (data.includes("Default password detected!")) {
                this.setState({
                    defaultPasswordChanged: false,
                    defaultUser: data.split("(")[1].split(")")[0],
                });
                return;
            }
            this.setState({ defaultPasswordChanged: true });
        });
        proc.catch((exception, data) => {
            console.error(
                "Error while verifying the system default password for openhabian/pi. Output: \n" +
          data +
          "\n\n Exception: \n" +
          exception
            );
        });
    }

    // check new password if complex and valid. if yes run change password
    setPassword() {
        if (
            this.state.newPassword !== "" &&
      this.state.newPassword === this.state.confirmNewPassword
        ) {
            if (this.checkPasswordStrength(this.state.newPassword) == true) {
                this.setState({ displayInvalidPassword: false });
                this.cmdChangePassword();
            } else {
                this.setState({
                    displayInvalidPassword: true,
                    invalidPasswordMessage:
            "The password must contain 8 characters and special characters",
                });
            }
        } else {
            if (this.checkPasswordStrength)
                this.setState({
                    displayInvalidPassword: true,
                    invalidPasswordMessage: "Passwords empty or do not match.",
                });
        }
    }

    // check for password complexity
    checkPasswordStrength(password) {
        if (
            /.{8,}/.test(password) /* at least 8 characters */ *
        (/.{12,}/.test(password) /* bonus if longer */ +
          /[a-z]/.test(password) /* a lower letter */ +
          /[A-Z]/.test(password) /* a upper letter */ +
          /\d/.test(password) /* a digit */ +
          /[^A-Za-z0-9]/.test(password)) /* a special character */ >=
      4
        ) {
            return true;
        }
        return false;
    }

    // changes the password of the openhabian or pi user
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
                directory: "/opt/openhab-cockpit/src/scripts",
            }
        );
        proc.then((data) => {
            console.log("Password updated.\n" + data);
            this.setState({
                showSuccessMessage: true,
                successful: !(
                    data.toLowerCase().includes("error") ||
          data.toLowerCase().includes("failed")
                ),
            });
            this.checkForDefaultPassword();
        });
        proc.catch((exception, data) => {
            var message =
        "Could not change the default password of user '" +
        this.state.defaultUser +
        "'. Output: \n" +
        data +
        "\n\n Exception: \n" +
        exception;
            console.error(message);
            this.setState({
                showSuccessMessage: true,
                successful: false,
                resultMessage: message,
            });
        });
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
