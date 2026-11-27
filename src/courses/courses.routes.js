import { Router } from "express";
import { createcourse, getCourses, searchCourse, updateCourse, deleteCourse } from "./courses.controller.js";
import {createCoursesValidator, getCourseByIdValidator, updateCourseValidator, deleteCourseValidator } from "../middlewares/courses-validators.js";
import { authenticate, requireRole } from '../middlewares/authenticate.js';

const router = Router();

router.post("/addcourse", authenticate, requireRole('TEACHER_ROLE'), createCoursesValidator, createcourse);

router.get("/", getCourses);

router.get("/searchCourse/:id", getCourseByIdValidator, searchCourse);

router.put("/updateCourse/:uid", authenticate, requireRole('TEACHER_ROLE'), updateCourseValidator, updateCourse);

router.delete("/deleteCourse/:courseId/:teacherId", authenticate, requireRole('TEACHER_ROLE'), deleteCourseValidator, deleteCourse)


export default router;
