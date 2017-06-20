const React = require("react");
const { StepWizard, Step } = require("../../common/components/stepwizard");
const { getMessage } = require("../../common/utils/MessageUtil");
const { WebApiStep } = require("../webapistep");
const { ActionStep } = require("../actionstep");
const { ReducerStep } = require("../reducerstep");
const { SelectorStep } = require("../selectorstep");
const { CompStep } = require("../compstep");

const StateSteps = props => {
  const { app } = props;

  return (
    <StepWizard onNextClick={() => true} onCancelClick={() => {}}>
      <Step title={getMessage("label.webapi")}>
        <WebApiStep app={app} />
      </Step>
      <Step title={getMessage("label.actions")}>
        <ActionStep app={app} />
      </Step>
      <Step title={getMessage("label.reducers")}>
        <ReducerStep app={app} />
      </Step>
      <Step title={getMessage("label.selectors")}>
        <SelectorStep app={app} />
      </Step>
      <Step title={getMessage("label.components")}>
        <CompStep app={app} />
      </Step>
    </StepWizard>
  );
};

module.exports = StateSteps;
