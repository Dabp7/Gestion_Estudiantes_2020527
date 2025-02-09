import { Router } from "express";
import { addCourseStudent, getStudentCourses, deleteStudentCourse, updateStudent, deleteStudent } from "./students.controller.js";
import { getStudentByIdValidator, deleteStudentValidator, updateStudentValidator } from "../middlewares/students-validators.js";

const router = Router();

router.post("/addcourse/:courseId", addCourseStudent);

router.get("/courses/:id", getStudentByIdValidator, getStudentCourses);

router.delete("/courses/:id/:courseId", deleteStudentValidator , deleteStudentCourse);

router.put("/editStudent/:uid", updateStudentValidator, updateStudent);

router.delete("/deleteStudent/:id", deleteStudentValidator, deleteStudent)


export default router;