const React = require("react");
const WebApiNode = require("./WebApiNode");

const codeLine = /\w.*[\n\r]/;

const CodeContainerNode = props => <pre>{props.children}</pre>;
const ImportNode = ({ node }) => <span>{node.data.get("module")}</span>;
const ExportContainerNode = props => (
  <pre>
    {props.node.data
      .get("exported")
      .map((exp, idx) => <div key={idx}>{exp}</div>)}
  </pre>
);
const IgnoreNode = ({ node }) => {
  const txt = node.getText();
  return codeLine.test(txt) ? <span>...</span> : null;
};

module.exports = {
  nodes: {
    import_dec: ImportNode,
    ignore: IgnoreNode,
    webapi: WebApiNode,
    export_decs: ExportContainerNode,
    code_container: CodeContainerNode
  }
};
