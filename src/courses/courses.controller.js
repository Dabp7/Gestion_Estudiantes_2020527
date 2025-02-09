"use strict"

import User from '../user/user.model.js'
import Course from './courses.model.js'

export const createcourse = async (req, res) => {
    try {
        const data = req.body;
        const user = await User.findOne({ email: data.email })

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            })
        }

        if (user.role !== "TEACHER_ROLE") {
            return res.status(403).json({ 
                success: false, 
                message: 'Únicamente los profesores pueden crear un curso' 
            })
        }

        const course = new Course({
            ...data,
            teacher: user._id,
            student: []
        })

        await course.save();

        res.status(200).json({
            success: true,
            course
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al crear el curso',
            error
        })
    }
}


export const getCourses = async (req, res) => {
    const { limite = 5, desde = 0 } = req.query;
    const query = { status: true }

    try {
        const courses = await Course.find(query)
            .skip(Number(desde))
            .limit(Number(limite));


        const total = await Course.countDocuments(query);

        res.status(200).json({
            success: true,
            total,
            courses
        })

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener todos los cursos',
            error: err.message
        })
    }
}

export const searchCourse = async (req, res) => {

    const { id } = req.params

    try {
        const course = await Course.findById(id)

        if (!course) {
            return res.status(404).json({ 
                success: false, 
                message: 'Curso no encontrado' 
            })
        }
        

        res.status(200).json({
            success: true,
            course: {
                ...course.toObject()
            },
        })

    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar el curso',
            error: err.message
        })
    }
}

export const updateCourse = async (req, res) => {
    try {
        const { uid } = req.params
        const  data  = req.body

        const course = await Course.findByIdAndUpdate(uid, data, { new: true });

        res.status(200).json({
            success: true,
            msg: 'Curso Actualizado',
            course,
        })
    } catch (err) {
        res.status(500).json({
            success: false,
            msg: 'Error al actualizar el curso',
            error: err.message
        })
    }
}

export const deleteCourse = async(req, res) =>{
    try {
        const { courseId, teacherId } = req.params
        
        const course = await Course.findById(courseId)

        if(!course){
            return res.status(404).json({
                success: false,
                message: "Curso no encontrado"
            })
        }

        if(course.teacher.toString() !== teacherId){
            return res.status(403).json({
                success: false,
                message: "No tienes permiso para eliminar este curso"
            })
        }

        await User.updateMany(
            { _id: { $in: course.students } },
            { $pull: { courses: courseId } } 
        )

        await Course.findByIdAndDelete(courseId);

        return res.status(200).json({
            success: true,
            message: "Curso eliminado"
        })

    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Error al eliminar el curso",
            error: err.message
        })
    }
}

