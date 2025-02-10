import { Router } from "express";
import { getCoursesTeacher } from "./teachers.controller.js";

const router = Router();


// Ruta del método get para listar los cursos que tiene asignado un solo profesor
router.get("/:uid", getCoursesTeacher);




export default router;