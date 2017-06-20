const React = require("react");

const ActionsNode = props => <pre>{props.children}</pre>;
const ActionNode = props => <div>{props.children}</div>;

module.exports = {
  ActionNode,
  ActionsNode
};
