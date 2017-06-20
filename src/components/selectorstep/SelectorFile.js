const React = require("react");
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

class SelectorFile extends React.Component {
  menus = [
    {
      icon: "delete",
      caption: getMessage("label.delete"),
      value: "delete"
    }
  ];

  primary = {
    icon: "edit",
    tooltip: getMessage("selector.edit"),
    linkTo: file => `/file/${file.uid}`
  };

  render() {
    const { file, devUrl } = this.props;
    const selectors = getDataFromFile(file, "selectors");
    return (
      <CodeFile file={file} menus={this.menus} primary={this.primary}>
        <List selectable ripple>
          {selectors.map((item, idx) => (
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
                caption={item.output}
                legend={item.input.join(", ")}
              />
            </ListItem>
          ))}
        </List>
      </CodeFile>
    );
  }
}

module.exports = SelectorFile;
