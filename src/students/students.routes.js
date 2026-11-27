import { Router } from "express";
import { addCourseStudent, getStudentCourses, deleteStudentCourse, updateStudent, deleteStudent } from "./students.controller.js";
import { getStudentByIdValidator, deleteStudentValidator, updateStudentValidator } from "../middlewares/students-validators.js";
import { param, body } from 'express-validator';
import { validarCampos } from '../middlewares/validate-fields.js';
import { authenticate, requireRole, requireSelf } from '../middlewares/authenticate.js';

const router = Router();
router.use(authenticate, requireRole('STUDENT_ROLE'));

// Ruta para asignar un curso a un estudiante
router.post("/addcourse/:courseId", param('courseId').isMongoId(), body('studentId').optional().isMongoId(), validarCampos, addCourseStudent);

// Ruta para listar los cursos
router.get("/courses/:id", requireSelf('id'), getStudentByIdValidator, getStudentCourses);

// Ruta para desasignar un curso a un estudiantes
router.delete("/courses/:id/:courseId", requireSelf('id'), deleteStudentValidator, param('courseId').isMongoId(), validarCampos, deleteStudentCourse);

// Ruta para editar un estudiante
router.put("/editStudent/:uid", requireSelf('uid'), updateStudentValidator, updateStudent);

// Ruta para eliminar el perfil de un estudiante
router.delete("/deleteStudent/:id", requireSelf('id'), deleteStudentValidator, deleteStudent)


export default router;
