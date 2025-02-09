import { body, param } from "express-validator";
import { userExists } from "../helpers/db-validators.js";
import { validarCampos } from "./validate-fields.js";   
import { handleErrors } from "./handle-errors.js";


export const getStudentByIdValidator = [
    param("id").isMongoId().withMessage("No es un ID válido de MongoDB"),
    param("id").custom(userExists),
    validarCampos,
    handleErrors
]

export const deleteStudentValidator = [
    param("id").isMongoId().withMessage("No es un ID válido de MongoDB"),
    param("id").custom(userExists),
    validarCampos,
    handleErrors
]

export const updateStudentValidator = [
    param("uid", "No es un ID válido").isMongoId(),
    param("uid").custom(userExists),
    validarCampos,
    handleErrors
]
