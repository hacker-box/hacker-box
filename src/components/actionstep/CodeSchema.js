const {
  ImportNode,
  IgnoreNode,
  ExportContainerNode,
  CodeContainerNode
} = require("../../common/components/codefile");
const {
  ActionNode,
  ActionsNode
} = require("./ActionsNode");

module.exports = {
  nodes: {
    import_dec: ImportNode,
    ignore: IgnoreNode,
    actions: ActionsNode,
    action: ActionNode,
    export_decs: ExportContainerNode,
    code_container: CodeContainerNode
  }
};
