import { Router } from "express";
import { getCoursesTeacher } from "./teachers.controller.js";
import { authenticate, requireRole, requireSelf } from '../middlewares/authenticate.js';
import { param } from 'express-validator';
import { validarCampos } from '../middlewares/validate-fields.js';

const router = Router();


// Ruta del método get para listar los cursos que tiene asignado un solo profesor
router.get("/:uid", authenticate, requireRole('TEACHER_ROLE'), requireSelf('uid'), param('uid').isMongoId(), validarCampos, getCoursesTeacher);




export default router;
