const Joi = require('joi');

const passwordRule = Joi.string().min(8).max(128).required();

const schemas = {
  signup: Joi.object({
    email: Joi.string().email().max(255).required(),
    password: passwordRule,
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required(),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: passwordRule,
  }),
};

function validate(schemaName) {
  return (req, res, next) => {
    const { error } = schemas[schemaName].validate(req.body, { abortEarly: false, stripUnknown: true });
    if (error) {
      return res.status(400).json({ error: error.details.map((d) => d.message) });
    }
    next();
  };
}

module.exports = { validate };
