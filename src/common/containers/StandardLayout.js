const React = require("react");
const {
  Layout,
  Panel,
  ProgressBar,
  Snackbar
} = require("react-toolbox");
const theme = require("./StandardLayout.css");
const { getMessage } = require("../utils/MessageUtil");
const { connect } = require("react-redux");
const { AppActions } = require("../actions");

class StandardLayout extends React.Component {
  render() {
    const {
      loading,
      showError,
      error,
      handleErrorDismiss,
      children
    } = this.props;

    return (
      <Layout className={theme.full}>
        <Panel className={theme.full}>
          <div className={theme.full}>
            {children}
            {loading &&
              <ProgressBar
                multicolor
                mode="indeterminate"
                type="circular"
                theme={theme}
              />}
          </div>
        </Panel>
        <Snackbar
          active={showError}
          action={getMessage("label.dismiss")}
          label={error && error.message}
          onClick={handleErrorDismiss}
          onTimeout={handleErrorDismiss}
          type="cancel"
        />
      </Layout>
    );
  }
}

function mapStateToProps(state) {
  return {
    ...state.app.flags
  };
}

function mapDispatchToProps(dispatch, props) {
  return {
    handleErrorDismiss() {
      dispatch(AppActions.flags.showError(false));
    }
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(StandardLayout);
