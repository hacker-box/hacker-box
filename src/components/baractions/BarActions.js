const React = require("react");
const ReactDOM = require("react-dom");
const { Navigation, Button, Link, Dialog } = require("react-toolbox");
const theme = require("./theme.css");

class BarActions extends React.Component {
  state = {
    showDownload: false
  };

  actions = [
    { label: "Cancel", onClick: () => this.setState({ showDownload: false }) }
  ];

  componentDidMount = () => {
    if (!window.twttr) {
      return;
    }
    if (this.twitter) {
      window.twttr.widgets.createFollowButton(
        "HackerHypenBox",
        ReactDOM.findDOMNode(this.twitter),
        {
          size: "large",
          showCount: false
        }
      );
    }
  };

  componentDidUpdate = () => {
    const { showDownload } = this.state;

    if (!window.twttr || !showDownload || !this.follow) {
      return;
    }
    window.twttr.widgets.createFollowButton(
      "HackerHypenBox",
      ReactDOM.findDOMNode(this.follow),
      {
        size: "large",
        showCount: false
      }
    );
  };

  render() {
    const { showDownload } = this.state;

    return (
      <Navigation type="horizontal">
        <Button
          label="Atom Package"
          primary
          raised
          icon="file_download"
          onClick={() => this.setState({ showDownload: true })}
        />
        <Dialog
          actions={this.actions}
          active={showDownload}
          onEscKeyDown={this.props.resetPin}
          onOverlayClick={this.props.resetPin}
          title="Atom Package"
        >
          <div className={theme.follow}>
            <span className={theme.ftext}>
              {" "}Atom package is currently in works.
            </span>
            <a ref={f => this.follow = f} />
            <span className={theme.ftext}>for updates.</span>
          </div>
        </Dialog>
        <Link ref={t => this.twitter = t} />
      </Navigation>
    );
  }
}

module.exports = BarActions;
