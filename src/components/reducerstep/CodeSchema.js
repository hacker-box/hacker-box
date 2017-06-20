const {
  ImportNode,
  IgnoreNode,
  ExportContainerNode,
  CodeContainerNode
} = require("../../common/components/codefile");
const {
  ReducersNode,
  ReducerNode,
  ReducerFunction
} = require("./ReducersNode");

module.exports = {
  nodes: {
    import_dec: ImportNode,
    ignore: IgnoreNode,
    reducers: ReducersNode,
    reducer: ReducerNode,
    reducer_function: ReducerFunction,
    export_decs: ExportContainerNode,
    code_container: CodeContainerNode
  }
};
