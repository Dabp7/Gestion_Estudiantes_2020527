import { Router } from "express";
import { createcourse, getCourses, searchCourse, updateCourse, deleteCourse } from "./courses.controller.js";
import {createCoursesValidator, getCourseByIdValidator, updateCourseValidator, deleteCourseValidator } from "../middlewares/courses-validators.js";

const router = Router();

router.post("/addcourse", createCoursesValidator, createcourse);

router.get("/", getCourses);

router.get("/searchCourse/:id", getCourseByIdValidator, searchCourse);

router.put("/updateCourse/:uid", updateCourseValidator, updateCourse);

router.delete("/deleteCourse/:courseId/:teacherId", deleteCourseValidator, deleteCourse)


export default router;