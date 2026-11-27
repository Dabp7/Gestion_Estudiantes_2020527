import { body, param } from "express-validator";
import { emailExists, usernameExists, userExists } from "../helpers/db-validators.js";
import { validarCampos } from "./validate-fields.js";
import { handleErrors } from "./handle-errors.js";

export const registerValidator = [
    // Verifica que el campo "name" no esté vacío
    body("name").isString().trim().isLength({min:1,max:25}).withMessage("El nombre es requerido (máximo 25 caracteres)"),
    
    // Verifica que el campo "username" no esté vacío
    body("username").notEmpty().withMessage("El username es requerido"),
    
    // Verifica que el campo "email" no esté vacío
    body("email").notEmpty().withMessage("El email es requerido"),
    
    // Valida que el email tenga un formato correcto
    body("email").isEmail().normalizeEmail().withMessage("No es un email válido"),
    
    // Usa una función personalizada para verificar si el email ya existe
    body("email").custom(emailExists),
    
    // Usa una función personalizada para verificar si el username ya existe
    body("username").custom(usernameExists),
    
    // Valida que la contraseña cumpla con ciertos requisitos de seguridad
    body("phone").matches(/^\d{8}$/).withMessage('El teléfono debe tener 8 dígitos'),
    body("password").isString().isLength({max:128}).isStrongPassword({
        minLength: 8, // Longitud mínima de 8 caracteres
        minLowercase: 1, // Mínimo una letra minúscula
        minUppercase: 1, // Mínimo una letra mayúscula
        minNumbers: 1, // Mínimo un número
        minSymbols: 1 // Mínimo un símbolo
    }),
    
    // Middleware para validar los campos y manejar errores
    validarCampos,
    handleErrors
]

export const loginValidator = [
    // Valida que el email tenga un formato correcto si se proporciona
    body("email").optional().isEmail().withMessage("No es un email válido"),
    
    // Valida que el username sea una cadena de texto si se proporciona
    body("username").optional().isString().withMessage("Username es en formato erróneo"),
    
    // Valida que la contraseña tenga al menos 4 caracteres
    body("password").isString().isLength({min: 8,max:128}).withMessage("El password debe contener entre 8 y 128 caracteres"),
    
    // Middleware para validar los campos y manejar errores
    validarCampos,
    handleErrors
]





export const getUserByIdValidator = [
    param("uid").isMongoId().withMessage("No es un ID válido de MongoDB"),
    param("uid").custom(userExists),
    validarCampos,
    handleErrors
]

export const deleteUserValidator = [
    param("uid").isMongoId().withMessage("No es un ID válido de MongoDB"),
    param("uid").custom(userExists),
    validarCampos,
    handleErrors
]

export const updatePasswordValidator = [
    param("uid").isMongoId().withMessage("No es un ID válido de MongoDB"),
    param("uid").custom(userExists),
    body("newPassword").isLength({min: 8}).withMessage("El password debe contener al menos 8 caracteres"),
    validarCampos,
    handleErrors
]

export const updateUserValidator = [
    param("uid", "No es un ID válido").isMongoId(),
    param("uid").custom(userExists),
    validarCampos,
    handleErrors
]



