import { Router } from "express";
import { addCourseStudent, getStudentCourses, deleteStudentCourse, updateStudent, deleteStudent } from "./students.controller.js";
import { getStudentByIdValidator, deleteStudentValidator, updateStudentValidator } from "../middlewares/students-validators.js";

const router = Router();

// Ruta para asignar un curso a un estudiante
router.post("/addcourse/:courseId", addCourseStudent);

// Ruta para listar los cursos
router.get("/courses/:id", getStudentByIdValidator, getStudentCourses);

// Ruta para desasignar un curso a un estudiantes
router.delete("/courses/:id/:courseId", deleteStudentValidator , deleteStudentCourse);

// Ruta para editar un estudiante
router.put("/editStudent/:uid", updateStudentValidator, updateStudent);

// Ruta para eliminar el perfil de un estudiante
router.delete("/deleteStudent/:id", deleteStudentValidator, deleteStudent)


export default router;