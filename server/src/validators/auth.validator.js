const Joi = require('joi');
const { createError } = require('../middlewares/errorHandler');

// Esquema de validación para login
const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'El email debe tener un formato válido',
      'any.required': 'El email es requerido'
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'La contraseña debe tener al menos 6 caracteres',
      'any.required': 'La contraseña es requerida'
    })
});

// Esquema de validación para refresh token
const refreshSchema = Joi.object({
  refreshToken: Joi.string()
    .required()
    .messages({
      'any.required': 'El refresh token es requerido'
    })
});

// Middleware de validación para login
function validateLogin(req, res, next) {
  const { error } = loginSchema.validate(req.body);
  
  if (error) {
    const errorMessage = error.details[0].message;
    return next(createError(errorMessage, 400));
  }
  
  next();
}

// Middleware de validación para refresh token
function validateRefresh(req, res, next) {
  const { error } = refreshSchema.validate(req.body);
  
  if (error) {
    const errorMessage = error.details[0].message;
    return next(createError(errorMessage, 400));
  }
  
  next();
}

module.exports = {
  validateLogin,
  validateRefresh,
  validateRegister
};

// Esquema de validación para registro
const registerSchema = Joi.object({
  nombre: Joi.string().min(2).required().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres',
    'any.required': 'El nombre es requerido'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'El email debe tener un formato válido',
    'any.required': 'El email es requerido'
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'La contraseña debe tener al menos 8 caracteres',
    'any.required': 'La contraseña es requerida'
  }),
  rol_id: Joi.number().integer().optional(),
  rol: Joi.string().optional()
});

// Middleware de validación para registro
function validateRegister(req, res, next) {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    const errorMessage = error.details[0].message;
    return next(createError(errorMessage, 400));
  }
  next();
}
