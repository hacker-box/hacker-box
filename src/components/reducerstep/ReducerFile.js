const React = require("react");
const { CodeFile } = require("../../common/components/codefile");
const { getMessage } = require("../../common/utils/MessageUtil");
const { List, ListItem, ListItemContent } = require("react-toolbox");
const { getDataFromFile } = require("../../common/utils/Helpers");

class ReducerFile extends React.Component {
  menus = [
    {
      icon: "delete",
      caption: getMessage("label.delete"),
      value: "delete"
    }
  ];

  primary = {
    icon: "edit",
    tooltip: getMessage("reducer.edit"),
    linkTo: file => `/file/${file.uid}`
  };

  render() {
    const { file } = this.props;
    const reducers = getDataFromFile(file, "reducers");
    return (
      <CodeFile
        file={file}
        menus={this.menus}
        primary={this.primary}
        notifications={file.updates}
      >
        <List>
          {reducers.map((item, idx) => (
            <ListItem key={idx}>
              <ListItemContent
                type="normal"
                key={idx}
                caption={item.key}
                legend={item.value}
              />
            </ListItem>
          ))}
        </List>
      </CodeFile>
    );
  }
}

module.exports = ReducerFile;
