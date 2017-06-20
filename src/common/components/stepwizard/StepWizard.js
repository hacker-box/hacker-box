const React = require("react");
const { Step: InjectStep } = require("./Step");
const { themr } = require("react-css-themr");
const { STEP_WIZARD } = require("../identifiers");

const stepWizardFactory = Step => {
  class StepWizard extends React.Component {
    state = {
      step: 0
    };

    render() {
      const { theme, children } = this.props;
      const { step } = this.state;
      const noOfChildren = React.Children.count(children);

      return (
        <div className={theme.wizard}>
          {children &&
            React.Children.map(children, (child, stepIndex) => {
              const done = stepIndex < step;
              const active = step === stepIndex;
              const stepNo = String(stepIndex + 1);
              const lastStep = stepIndex === noOfChildren - 1;
              return React.cloneElement(child, {
                active,
                done,
                stepNo,
                lastStep,
                stepIndex
              });
            })}
        </div>
      );
    }
  }

  return StepWizard;
};

const StepWizard = stepWizardFactory(InjectStep);
const ThemedStepWizard = themr(STEP_WIZARD)(StepWizard);

module.exports = {
  StepWizard,
  ThemedStepWizard,
  stepWizardFactory
};
