const React = require("react");
const { CodeFile } = require("../../common/components/codefile");
const { getMessage } = require("../../common/utils/MessageUtil");
const { List, ListItem, ListItemContent } = require("react-toolbox");
const { getDataFromFile } = require("../../common/utils/Helpers");

class IndexFile extends React.Component {
  menus = [];

  primary = {
    icon: "edit",
    tooltip: getMessage("reducer.edit"),
    linkTo: file => `/file/${file.uid}`
  };

  render() {
    const { file } = this.props;
    const exports = getDataFromFile(file, "exports");
    return (
      <CodeFile
        file={file}
        menus={this.menus}
        primary={this.primary}
        notifications={file.updates}
      >
        <List>
          {exports.map((item, idx) => (
            <ListItem key={idx}>
              <ListItemContent type="normal" key={idx} caption={item} />
            </ListItem>
          ))}
        </List>
      </CodeFile>
    );
  }
}

module.exports = IndexFile;
