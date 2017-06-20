const React = require("react");
const { Editor } = require("slate");
const { IS_MAC } = require("slate/lib/constants/environment");
const theme = require("./theme.css");
const { connect } = require("react-redux");
const Actions = require("./Actions");
const EditCode = require("slate-edit-code")({
  exitBlockType: null,
  allowMarks: true
});
const DataPlugin = require("./DataPlugin")();
const Prism = require("slate-prism")();
const notifyTheme = require("./notifications.css");

const {
  CurrentFileSelector
} = require("./Selectors");
const {
  Button,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  IconMenu
} = require("react-toolbox");
const {
  getDataActions,
  patchCodeFromData,
  getNewFileContent,
  getDataState,
  getDataStateSync,
  applySuggestionToData
} = require("./Helpers");

const codePlugins = [EditCode, Prism];
const dataPlugins = [EditCode, Prism, DataPlugin];
const codeTypePlugins = {
  faker: [EditCode, Prism]
};
const altMod = IS_MAC ? "Alt Cmd" : "Alt Ctrl";

const schema = {
  nodes: {
    code_block: props => (
      <pre className={`language-javascript ${theme.pre}`}>
        <code className="language-javascript" {...props.attributes}>
          {props.children}
        </code>
      </pre>
    )
  },
  marks: {
    curly: props => {
      return (
        <span className={theme.curly} {...props.attributes}>
          {props.children}
        </span>
      );
    },
    syntax_error: props => {
      return (
        <span className={theme.syntax} {...props.attributes}>
          {props.children}
        </span>
      );
    }
  }
};

class FileEditor extends React.Component {
  state = {
    showNotifcation: false,
    saveData: false,
    shortCut: true
  };

  updateStateFromCode = props => {
    const { fileIds } = props;
    const {
      uid,
      module: codeType,
      data,
      codeState,
      dataState
    } = props.file;

    if (!uid) {
      return;
    }

    if (!codeState) {
      const codeState = getNewFileContent(codeType);
      this.props.setCodeEditorState(uid, codeState);
      this.props.saveData({ ...props.file, codeState }, fileIds);
    }

    if (!dataState) {
      getDataState(codeType, data)
        .then(dState => this.props.setDataEditorState(uid, dState))
        .catch(() =>
          this.props.setDataEditorState(uid, getDataStateSync(codeType, data)));

      clearTimeout(this.tout);
      this.tout = setTimeout(() => this.props.updateFile({ uid, data }), 100);
    }
  };

  handleSaveData = () =>
    this.props.saveData(this.props.file, this.props.fileIds);

  handleSaveCode = () =>
    this.props.saveCode(this.props.file, this.props.fileIds);

  componentWillMount() {
    const { fileId } = this.props;
    this.props.setCurrentFile(fileId);
    this.props
      .getFileContent(fileId)
      .then(() => this.updateStateFromCode(this.props));
  }

  componentWillReceiveProps = props => {
    const { updates } = this.props.file;
    const { saveData } = this.state;
    if (
      updates &&
      props.file.updates &&
      props.file.updates.length > updates.length
    ) {
      this.setState({ showNotifcation: true });
    }

    if (saveData) {
      this.props.saveData(props.file, props.fileIds);
      this.setState({ saveData: false });
    }
    this.updateStateFromCode(props);
  };

  handleNotificationClick = (event, suggestion) => {
    const { file } = this.props;
    applySuggestionToData(file, suggestion).then(editorState => {
      this.props.setDataEditorState(file.uid, editorState);
      this.props.removeSuggestion(file.uid, suggestion);
      this.setState({ saveData: true });
    });
  };

  handleDataKeyDown = (event, data) => {
    const { file, fileIds } = this.props;
    if (data.isMod && data.key === "s") {
      event.preventDefault();
      this.props.saveData(file, fileIds);
    } else if (data.isModAlt && "0123456789".indexOf(data.key) !== -1) {
      const suggestion = file.updates[data.key];
      if (suggestion) {
        event.preventDefault();
        this.handleNotificationClick(event, suggestion);
      }
    }
  };

  handleCodeKeyDown = (event, data) => {
    const { file, fileIds } = this.props;
    if (data.isMod && data.key === "s") {
      event.preventDefault();
      this.props.saveCode(file, fileIds);
    }
  };

  componentDidUpdate = () => {
    if (document.activeElement.tagName === "BODY") {
      this.ftout = setTimeout(
        () => this.dataEditor && this.dataEditor.focus(),
        500
      );
    } else {
      clearTimeout(this.ftout);
    }
  };

  renderShotcut = () => {
    if (this.state.shortCut === false) {
      return null;
    }
    return (
      <div className={theme.shotcut}>
        <div className={theme.header}>
          <span>Short-Cuts for underlined text</span>
          <IconButton
            icon="close"
            onClick={() => this.setState({ shortCut: false })}
          />
        </div>
        <div className={theme.row}>
          <div>{altMod} =</div>
          <div>Clone</div>
        </div>
        <div className={theme.row}>
          <div>{altMod} -</div>
          <div>Delete</div>
        </div>
        <div className={theme.row}>
          <div>{altMod} }</div>
          <div>Select {">>"}</div>
        </div>
        <div className={theme.row}>
          <div>{altMod} {"{"}</div>
          <div>{"<<"} Select</div>
        </div>
      </div>
    );
  };

  renderNotifications = () => {
    const { updates } = this.props.file;
    const { showNotifcation } = this.state;

    if (!updates || updates.length === 0) {
      return null;
    }
    const bubble = (
      <Avatar theme={notifyTheme} title={String(updates.length)} />
    );

    return (
      <div className={theme.menuWrapper}>
        <IconButton
          icon={bubble}
          onClick={() => this.setState({ showNotifcation: !showNotifcation })}
        />
        <Menu
          className={theme.menu}
          active={showNotifcation}
          position="topLeft"
          onHide={() => this.setState({ showNotifcation: false })}
        >
          {updates.map((noti, idx) => (
            <MenuItem
              key={idx}
              value={noti}
              caption={`${noti.caption} (${altMod} ${idx})`}
              onClick={e => this.handleNotificationClick(noti, e)}
            />
          ))}
        </Menu>
      </div>
    );
  };

  render() {
    const { file } = this.props;
    const { dataState, codeState } = file;
    const saveLabel = `Save (${IS_MAC ? "Cmd+S" : "Ctrl+S"})`;

    return (
      <div>
        <div className={theme.container}>
          <div className={theme.left}>
            <div className={theme.actions}>
              <div className={theme.label}>
                Data
              </div>
              <div className={theme.actionBtns}>
                {this.renderNotifications()}
                <Button label={saveLabel} onClick={this.handleSaveData} />
                {!this.state.shortCut &&
                  <IconMenu position="topRight">
                    <MenuItem
                      caption="Show Shortcut"
                      onClick={() => this.setState({ shortCut: true })}
                    />
                  </IconMenu>}
              </div>
            </div>
            {dataState &&
              <Editor
                state={dataState}
                className={theme.editor}
                placeholder="Data"
                placeholderClassName={theme.placeholder}
                plugins={codeTypePlugins[file.module] || dataPlugins}
                schema={schema}
                spellCheck={false}
                onKeyDown={this.handleDataKeyDown}
                ref={dEd => this.dataEditor = dEd}
                onChange={editorState =>
                  this.props.setDataEditorState(file.uid, editorState)}
              />}
            {this.renderShotcut()}
          </div>
          <div className={theme.right}>
            <div className={theme.actions}>
              <div className={theme.label}>
                CODE
              </div>
              <div className={theme.actionBtns}>
                <Button label={saveLabel} onClick={this.handleSaveCode} />
              </div>
            </div>
            {codeState &&
              <Editor
                ref={editor => this.codeEditor = editor}
                state={codeState}
                className={theme.editor}
                placeholder="Code"
                placeholderClassName={theme.placeholder}
                plugins={codePlugins}
                schema={schema}
                spellCheck={false}
                onKeyDown={this.handleCodeKeyDown}
                onChange={editorState =>
                  this.props.setCodeEditorState(file.uid, editorState)}
              />}
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    file: CurrentFileSelector(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    setCurrentFile: fileId => dispatch(Actions.setCurrentFile(fileId)),
    getFileContent: fileId => dispatch(Actions.getFileContent(fileId)),
    setCodeEditorState: (fileId, editorState) =>
      dispatch(
        Actions.setEditorState({ fileId, type: "codeState", editorState })
      ),
    setDataEditorState: (fileId, editorState) =>
      dispatch(
        Actions.setEditorState({ fileId, type: "dataState", editorState })
      ),
    saveCode: (file, fileIds) => {
      const actions = getDataActions(file);
      actions.forEach(action =>
        dispatch(
          Actions.updateEditorData({
            fileIds,
            fileId: file.uid,
            filePath: file.path,
            action
          })
        ));
    },
    saveData: (file, fileIds) => {
      patchCodeFromData(file).then(codeState => {
        const actions = getDataActions({ ...file, codeState });
        actions.forEach(action =>
          dispatch(
            Actions.updateEditorData({
              fileIds,
              fileId: file.uid,
              filePath: file.path,
              action
            })
          ));
        dispatch(
          Actions.setEditorState({
            fileId: file.uid,
            type: "codeState",
            editorState: codeState
          })
        );
      });
    },
    updateFile: file => dispatch(Actions.updateFile(file)),
    removeSuggestion: (fileId, suggestion) =>
      dispatch(Actions.removeSuggestion({ fileId, suggestion }))
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(FileEditor);
