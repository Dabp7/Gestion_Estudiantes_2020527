import mongoose from 'mongoose'
import Course from './courses.model.js'

export const createcourse = async (req, res, next) => {
    try {
        if (req.body.email && req.body.email !== req.user.email) return res.status(403).json({ success: false, message: 'Solo podés crear cursos propios' })
        const course = await Course.create({ name: req.body.name, description: req.body.description, teacher: req.user._id, students: [] })
        res.status(201).json({ success: true, course })
    } catch (error) { next(error) }
}
export const getCourses = async (req, res, next) => {
    try {
        const limit = Number(req.query.limite ?? 20), offset = Number(req.query.desde ?? 0)
        if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100 || !Number.isSafeInteger(offset) || offset < 0) return res.status(400).json({ success: false, message: 'Paginación inválida' })
        const [courses, total] = await Promise.all([Course.find({ status: true }).select('-students').sort({ _id: 1 }).skip(offset).limit(limit), Course.countDocuments({ status: true })])
        res.json({ success: true, total, courses })
    } catch (error) { next(error) }
}
export const searchCourse = async (req, res, next) => {
    try {
        const course = await Course.findOne({ _id: req.params.id, status: true }).select('-students')
        if (!course) return res.status(404).json({ success: false, message: 'Curso no encontrado' })
        res.json({ success: true, course })
    } catch (error) { next(error) }
}
export const updateCourse = async (req, res, next) => {
    try {
        if (Object.keys(req.body).some(key => !['name', 'description'].includes(key))) return res.status(400).json({ success: false, message: 'Solo se pueden editar name y description' })
        const course = await Course.findOneAndUpdate({ _id: req.params.uid, teacher: req.user._id, status: true }, req.body, { new: true, runValidators: true })
        if (!course) return res.status(404).json({ success: false, message: 'Curso propio no encontrado' })
        res.json({ success: true, msg: 'Curso actualizado', course })
    } catch (error) { next(error) }
}
export const deleteCourse = async (req, res, next) => {
    try {
        if (req.params.teacherId !== req.user.id) return res.status(403).json({ success: false, message: 'El profesor de la URL debe ser el autenticado' })
        const course = await mongoose.connection.transaction(async session => Course.findOneAndDelete({ _id: req.params.courseId, teacher: req.user._id }).session(session))
        if (!course) return res.status(404).json({ success: false, message: 'Curso propio no encontrado' })
        res.json({ success: true, message: 'Curso e inscripciones eliminados' })
    } catch (error) { next(error) }
}
