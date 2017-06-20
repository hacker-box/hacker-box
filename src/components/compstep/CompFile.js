const React = require("react");
const { CodeFile } = require("../../common/components/codefile");
const { getMessage } = require("../../common/utils/MessageUtil");
const { List, ListItem, ListItemContent } = require("react-toolbox");
const { getDataFromFile } = require("../../common/utils/Helpers");

class CompFile extends React.Component {
  menus = [
    {
      icon: "delete",
      caption: getMessage("label.delete"),
      value: "delete"
    }
  ];

  primary = {
    icon: "edit",
    tooltip: getMessage("comp.edit"),
    linkTo: file => `/file/${file.uid}`
  };

  render() {
    const { file } = this.props;
    const components = getDataFromFile(file, "components");
    return (
      <CodeFile file={file} menus={this.menus} primary={this.primary}>
        <List selectable ripple>
          {components.map((item, idx) => (
            <ListItem key={idx}>
              <ListItemContent
                type="normal"
                key={idx}
                caption={item.name}
                legend={item.children.join(", ")}
              />
            </ListItem>
          ))}
        </List>
      </CodeFile>
    );
  }
}

module.exports = CompFile;
