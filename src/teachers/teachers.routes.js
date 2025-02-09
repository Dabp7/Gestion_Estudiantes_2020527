import { Router } from "express";
import { getCoursesTeacher } from "./teachers.controller.js";

const router = Router();

router.get("/:uid", getCoursesTeacher);




export default router;