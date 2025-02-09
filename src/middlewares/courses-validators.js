import { body, param } from "express-validator";
import { courseExists } from "../helpers/db-validators.js";
import { validarCampos } from "./validate-fields.js";   
import { handleErrors } from "./handle-errors.js";

export const createCoursesValidator = [
    body("name").notEmpty().withMessage("El nombre es requerido"),
    body("description").notEmpty().withMessage("La descripción es requerida"),
    body("email").isEmail().withMessage("El correo del profesor es requerido y debe ser válido"),
    validarCampos,
    handleErrors
]

export const getCourseByIdValidator = [
    param("id").isMongoId().withMessage("No es un ID válido de MongoDB"),
    param("id").custom(courseExists),
    validarCampos,
    handleErrors
]

export const updateCourseValidator = [
    param("uid", "No es un ID válido").isMongoId(),
    param("uid").custom(courseExists),
    validarCampos,
    handleErrors
]

export const deleteCourseValidator = [
    param("courseId", "No es un ID válido").isMongoId(),
    param("teacherId", "No es un ID de mongo válido").isMongoId(),
    param("courseId").custom(courseExists),
    validarCampos,
    handleErrors
]
