const { createValidator } = require("revalidate");

const EmailValidator = createValidator(
  message =>
    value => {
      if (value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value)) {
        return message;
      }
    },
  "Invalid email address"
);

module.exports = EmailValidator;
