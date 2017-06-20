const React = require("react");
const theme = require("./theme.css");
const notify = require("./notification.css");
const {
  IconMenu,
  MenuItem,
  IconButton,
  Tooltip,
  Avatar,
  Card
} = require("react-toolbox");

const TooltipIconButton = Tooltip(IconButton);

class CodeFile extends React.Component {
  static contextTypes = {
    router: React.PropTypes.shape({
      history: React.PropTypes.shape({
        push: React.PropTypes.func.isRequired,
        replace: React.PropTypes.func.isRequired,
        createHref: React.PropTypes.func.isRequired
      }).isRequired
    }).isRequired
  };

  handleOnClick = ev => {
    const { file, primary } = this.props;
    if (primary.onClick) {
      return primary.onClick(ev);
    }
    const { history } = this.context.router;
    const url = typeof primary.linkTo === "function"
      ? primary.linkTo(file)
      : primary.linkTo;
    ev.preventDefault();
    history.push(url);
  };

  renderNotifications() {
    const { notifications } = this.props;
    if (!notifications || notifications.length === 0) {
      return null;
    }
    const bubble = (
      <Avatar theme={notify} title={String(notifications.length)} />
    );

    return <IconButton icon={bubble} onClick={this.handleOnClick} />;
  }

  render() {
    const {
      file,
      primary,
      menus,
      children
    } = this.props;
    return (
      <Card className={theme.card}>
        <div className={theme.file}>
          <div className={theme.header}>
            <div>
              <span className={theme.path}>
                {file.path}
              </span>
              {this.renderNotifications()}
            </div>
            <div className={theme.actionIcons}>
              {primary &&
                <TooltipIconButton
                  icon={primary.icon}
                  tooltip={primary.tooltip}
                  onClick={this.handleOnClick}
                  tooltipPosition="bottom"
                />}
              {menus &&
                <IconMenu icon="more_vert" menuRipple position="topRight">
                  {menus.map((menu, idx) => (
                    <MenuItem
                      key={idx}
                      value={menu.value}
                      icon={menu.icon}
                      caption={menu.caption}
                      onClick={menu.onClick}
                    />
                  ))}
                </IconMenu>}
            </div>
          </div>
          <div className={theme.body}>
            {children}
          </div>
        </div>
      </Card>
    );
  }
}

module.exports = CodeFile;
