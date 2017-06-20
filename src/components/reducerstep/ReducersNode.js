const React = require("react");

const ReducersNode = props => <pre>{props.children}</pre>;
const ReducerNode = props => <div>{props.children}</div>;
const ReducerFunction = props => <pre>{props.children}</pre>;

module.exports = {
  ReducerNode,
  ReducersNode,
  ReducerFunction
};
