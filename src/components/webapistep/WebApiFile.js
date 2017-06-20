const React = require("react");
const { CodeFile } = require("../../common/components/codefile");
const theme = require("./WebApiFile.css");
const {
  List,
  ListItem,
  ListItemContent,
  IconButton,
  Tooltip,
  ListItemText
} = require("react-toolbox");

const {
  getMessage
} = require("../../common/utils/MessageUtil");
const { getDataFromFile } = require("../../common/utils/Helpers");
const TooltipButton = Tooltip(IconButton);

class WebApiFile extends React.Component {
  state = {
    showDialog: false
  };

  menus = [
    {
      icon: "delete",
      caption: getMessage("label.delete"),
      value: "delete"
    }
  ];

  primary = {
    icon: "edit",
    tooltip: getMessage("edit.webapi"),
    linkTo: file => `/file/${file.uid}`
  };

  serverResponseClick = item => {
    const { file, fakerFiles } = this.props;
    const { verb, url } = item;
    const path = `server/api/faker/${verb}${url}.js`;
    const fakeItem = fakerFiles.find(ff => ff.path === path);
    this.props.onFakerServer(file, path, fakeItem);
  };

  render() {
    const { file } = this.props;
    const webapi = getDataFromFile(file, "webapis");
    return (
      <CodeFile
        file={file}
        menus={this.menus}
        primary={this.primary}
        notifications={file.updates}
      >
        <List>
          {webapi.map((item, idx) => (
            <ListItem
              key={idx}
              rightIcon={
                <TooltipButton
                  icon="compare_arrows"
                  tooltip={getMessage("edit.server.response")}
                  onClick={() => this.serverResponseClick(item)}
                />
              }
            >
              <ListItemContent
                type="auto"
                theme={theme}
                key={`${item.name}${idx}`}
              >
                <div>
                  <ListItemText primary>{item.name}()</ListItemText>
                  <ListItemText>
                    {item.verb.toUpperCase()} {item.url}
                  </ListItemText>
                </div>
              </ListItemContent>
            </ListItem>
          ))}
        </List>
      </CodeFile>
    );
  }
}

module.exports = WebApiFile;
