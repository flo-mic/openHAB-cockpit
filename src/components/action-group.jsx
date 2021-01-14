import React from "react";
import {
    ActionList,
    ActionListItem,
    Dropdown,
    KebabToggle
} from '@patternfly/react-core';

import "../custom.scss";
import "../patternfly.scss";
import "core-js/stable";
import "regenerator-runtime/runtime";

export default class ActionGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
        };
        this.handleToggle = (isOpen, event) => {
            event.stopPropagation();
            this.setState({
                isOpen
            });
        };
        this.handleSelect = event => {
            event.stopPropagation();
            this.setState({
                isOpen: !this.state.isOpen
            });
        };
    }

    render() {
        return (
            <ActionList>
                <ActionListItem>
                    <Dropdown
                    toggle={<KebabToggle onToggle={this.handleToggle} />}
                    isOpen={this.state.isOpen}
                    isPlain
                    dropdownItems={this.props.dropdownItems}
                    position={this.props.position}
                    />
                </ActionListItem>
            </ActionList>
        );
    }
}
