const { STEP_WIZARD, STEP } = require("../identifiers");
const { Avatar, Button } = require("react-toolbox");
const { themr } = require("react-css-themr");
const theme = require("./theme.css");
const { stepWizardFactory } = require("./StepWizard");
const { stepFactory } = require("./Step");

const UnthemedStep = stepFactory(Avatar, Button);
const Step = themr(STEP, theme)(UnthemedStep);

const UnthemedStepWizard = stepWizardFactory(Step);
const StepWizard = themr(STEP_WIZARD, theme)(UnthemedStepWizard);

module.exports = {
  Step,
  StepWizard
};
