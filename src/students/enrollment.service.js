import mongoose from 'mongoose'
import User from '../user/user.model.js'
import Course from '../courses/courses.model.js'
import { HttpError } from '../helpers/http-error.js'

export async function enroll(studentId, courseId) {
    return mongoose.connection.transaction(async session => {
        // Every enrollment for this student writes the same document. Concurrent
        // transactions conflict here and retry against a fresh count snapshot.
        const student = await User.findOneAndUpdate({ _id: studentId, role: 'STUDENT_ROLE', status: true }, { $inc: { enrollmentVersion: 1 } }, { session, new: true })
        if (!student) throw new HttpError(404, 'Estudiante no encontrado')
        const course = await Course.findOne({ _id: courseId, status: true }).session(session)
        if (!course) throw new HttpError(404, 'Curso no encontrado')
        if (course.students.some(id => id.equals(studentId))) throw new HttpError(409, 'El estudiante ya está inscrito en este curso')
        if (await Course.countDocuments({ students: studentId, status: true }).session(session) >= 3) throw new HttpError(409, 'No puede unirse a más de 3 cursos')
        course.students.addToSet(studentId)
        await course.save({ session })
        return course
    })
}

export async function withdraw(studentId, courseId) {
    return mongoose.connection.transaction(async session => {
        const student = await User.findOneAndUpdate({ _id: studentId, role: 'STUDENT_ROLE', status: true }, { $inc: { enrollmentVersion: 1 } }, { session, new: true })
        if (!student) throw new HttpError(404, 'Estudiante no encontrado')
        const course = await Course.findOne({ _id: courseId, status: true }).session(session)
        if (!course) throw new HttpError(404, 'Curso no encontrado')
        if (!course.students.some(id => id.equals(studentId))) throw new HttpError(409, 'El estudiante no está asignado a este curso')
        course.students.pull(studentId)
        await course.save({ session })
        return course
    })
}
