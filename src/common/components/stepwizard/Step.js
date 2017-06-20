const React = require("react");
const classnames = require("classnames");
const { themr } = require("react-css-themr");
const InjectAvatar = require("react-toolbox/lib/avatar/Avatar");
const InjectButton = require("react-toolbox/lib/button/Button");
const { STEP } = require("../identifiers");

const stepFactory = (Avatar, Button) => {
  class Step extends React.Component {
    static defaultProps = {
      labels: {
        continue: "Continue",
        cancel: "Cancel",
        finish: "Finish"
      }
    };

    render() {
      const { theme, title, subtext, children } = this.props;
      const {
        active,
        done,
        stepNo
      } = this.props; //Supplied by wizard
      /*
      const avClassName = classnames(theme.avatar, {
        [theme.active]: active || done
      });
      */
      const hdrClass = classnames(theme.header, {
        [theme.middleAlign]: !subtext,
        [theme.subtle]: !active
      });
      /*
      const bodyClass = classnames(theme.body, {
        [theme.hideBody]: !active && !done
      });
      */
      return (
        <div className={theme.step}>
          <div className={hdrClass}>
            <Avatar
              title={stepNo}
              theme={theme}
              className={theme.avatar}
              icon={done ? "check" : ""}
            >
              {done && <i className="material-icons">check</i>}
            </Avatar>
            <div>
              <div>{title}</div>
              {subtext && <div className={theme.subtext}>{subtext}</div>}
            </div>
          </div>
          <div className={theme.body}>
            {typeof children === "function"
              ? children(done)
              : React.Children.map(children, child =>
                  React.cloneElement(child, { "data-done": done }))}
          </div>
        </div>
      );
    }
  }

  return Step;
};

const Step = stepFactory(InjectAvatar, InjectButton);
const ThemedStep = themr(STEP)(Step);

module.exports = {
  Step,
  ThemedStep,
  stepFactory
};
