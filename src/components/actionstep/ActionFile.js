const React = require("react");
//const theme = require("./ActionFile.css");
const { CodeFile } = require("../../common/components/codefile");
const { getMessage } = require("../../common/utils/MessageUtil");
const {
  List,
  ListItem,
  ListItemContent,
  IconButton,
  Tooltip
} = require("react-toolbox");
const { getDataFromFile } = require("../../common/utils/Helpers");
const TooltipButton = Tooltip(IconButton);

class ActionFile extends React.Component {
  menus = [
    {
      icon: "delete",
      caption: getMessage("label.delete"),
      value: "delete"
    }
  ];

  primary = {
    icon: "edit",
    tooltip: getMessage("actions.edit"),
    linkTo: file => `/file/${file.uid}`
  };

  render() {
    const { file, devUrl } = this.props;
    const actions = getDataFromFile(file, "actions");
    return (
      <CodeFile
        file={file}
        menus={this.menus}
        primary={this.primary}
        notifications={file.updates}
      >
        <List>
          {actions.map((item, idx) => (
            <ListItem
              key={idx}
              rightIcon={
                devUrl &&
                  <TooltipButton
                    icon="directions_run"
                    accent
                    tooltip={getMessage("action.trigger")}
                    onClick={() => this.props.onTriggerAction(item)}
                  />
              }
            >
              <ListItemContent
                type="normal"
                key={idx}
                caption={`${item.key}()`}
                legend={item.value}
              />
            </ListItem>
          ))}
        </List>
      </CodeFile>
    );
  }
}

module.exports = ActionFile;
