import mongoose from 'mongoose'
import User from '../user/user.model.js'
import Course from '../courses/courses.model.js'
import { enroll, withdraw } from './enrollment.service.js'

export const addCourseStudent = async (req, res, next) => {
    try {
        if (req.body.studentId && req.body.studentId !== req.user.id) return res.status(403).json({ success: false, message: 'No podés inscribir a otro estudiante' })
        const course = await enroll(req.user.id, req.params.courseId)
        res.json({ success: true, message: 'Estudiante inscrito exitosamente', course })
    } catch (error) { next(error) }
}
export const getStudentCourses = async (req, res, next) => {
    try {
        const courses = await Course.find({ students: req.user._id, status: true }).sort({ _id: 1 })
        res.json({ success: true, student: req.user.name, courses })
    } catch (error) { next(error) }
}
export const deleteStudentCourse = async (req, res, next) => {
    try { res.json({ success: true, message: 'Estudiante eliminado del curso', course: await withdraw(req.user.id, req.params.courseId) }) }
    catch (error) { next(error) }
}
export const updateStudent = async (req, res, next) => {
    try {
        const fields = Object.fromEntries(['name', 'username', 'email', 'phone'].filter(key => req.body[key] !== undefined).map(key => [key, req.body[key]]))
        if (Object.keys(req.body).some(key => !Object.hasOwn(fields, key))) return res.status(400).json({ success: false, message: 'Solo se pueden editar name, username, email y phone' })
        const user = await User.findOneAndUpdate({ _id: req.user._id, status: true }, fields, { new: true, runValidators: true })
        res.json({ success: true, msg: 'Estudiante actualizado', user })
    } catch (error) { next(error) }
}
export const deleteStudent = async (req, res, next) => {
    try {
        await mongoose.connection.transaction(async session => {
            await User.updateOne({ _id: req.user._id }, { $set: { status: false }, $inc: { enrollmentVersion: 1 } }, { session })
            await Course.updateMany({ students: req.user._id }, { $pull: { students: req.user._id } }, { session })
        })
        res.json({ success: true, message: 'Perfil desactivado e inscripciones eliminadas' })
    } catch (error) { next(error) }
}
