import React from "react";
import ReactDOM from "react-dom";
import "./modal.scss";
import "../custom.scss";
import "./patternfly.scss";

export default class Modal extends React.Component {
    constructor() {
        super();
        this.state = { prevStateShow: "", node: React.createRef() };
        this.onClose = (e) => {
            if (!this.props.disableModalClose)
                this.props.onClose && this.props.onClose(e);
        };
        this.handleClickOutsideModal = (e) => {
            const domNode = ReactDOM.findDOMNode(this.state.node);
            if (!domNode.contains(e.target)) this.onClose(e);
        };
        this.handleModalEscKeyEvent = (e) => {
            if (e.keyCode == 27) this.onClose(e);
        };
    }

    set_event_Handler() {
        if (this.props.show === this.state.prevStateShow) return;
        if (this.props.show) {
            document.addEventListener("click", this.handleClickOutsideModal, false);
            document.addEventListener("keydown", this.handleModalEscKeyEvent, false);
            this.setState({ prevStateShow: this.props.show });
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

    componentDidUpdate() {
        this.set_event_Handler();
    }

    componentWillUnmount() {
        document.removeEventListener("click", this.handleClickOutsideModal, false);
        document.removeEventListener("keydown", this.handleModalEscKeyEvent, false);
    }

    render() {
        const classesModalFooter = this.props.showCloseButton
            ? "display-block modal-footer"
            : "display-none";
        const showHideBackground = this.props.show
            ? "modal-backdrop in"
            : "display-none";

        const showHideModal = this.props.show
            ? "modal-container in"
            : "modal display-none";

        const hideCloseButtons = !this.props.disableModalClose
            ? "display-block"
            : "display-none";
        if (!this.props.show) {
            return null;
        }
        return (
            <div>
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
                                    {this.props.header}
                                    <div className={hideCloseButtons}>
                                        <button
                      className="pf-c-button close-button"
                      type="button"
                      onClick={(e) => {
                          this.onClose(e);
                      }}
                                        >
                                            X
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-body scroll">{this.props.body}</div>
                            <div className={classesModalFooter}>
                                {this.props.footer}
                                <div>
                                    <div className={hideCloseButtons}>
                                        <button
                      className="pf-c-button pf-m-secondary"
                      type="button"
                      onClick={(e) => {
                          this.onClose(e);
                      }}
                                        >
                                            Close
                                        </button>
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
