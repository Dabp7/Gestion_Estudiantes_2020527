"use strict"

import User from '../user/user.model.js'
import Course from '../courses/courses.model.js'


export const addCourseStudent = async(req, res) =>{
    try {
        const { studentId } = req.body
        const { courseId } = req.params

        
        const course = await Course.findById(courseId)

        if(!course){
            return res.status(404).json({ 
                success: false, 
                message: "Curso no encontrado" 
            })
        }

        const student = await User.findById(studentId)

        if(!student || student.role !== "STUDENT_ROLE"){
            return res.status(400).json({ 
                success: false, 
                message: "Solo estudiates pueden unirse a cursos" 
            })
        }
 
        if(course.students.includes(studentId)){
            return res.status(400).json({ 
                success: false, 
                message: "El estudiante ya está inscrito en este curso" 
            })
        }

        
        const cursosAsignados = await Course.find({ students: studentId })
    
        if(cursosAsignados.length >= 3){
            return res.status(400).json({ 
                success: false, 
                message: "No puede unirse a más de 3 cursos" 
            })
        }

        
        course.students.push(studentId);

        await course.save()

        res.status(200).json({
            success: true,
            message: "Estudiante inscrito exitosamente",
            course
        })


    }catch(error){
        res.status(500).json({ 
            success: false, 
            message: "Error al inscribir al estudiante",
            error: error.message 
        })
    }
}

export const getStudentCourses = async(req, res) =>{

    try {
        const { id } = req.params

        
        const student = await User.findById(id)

        if(!student){
            return res.status(404).json({ 
                success: false, 
                message: "Estudiante no encontrado" 
            })
        }

        if(student.role !== "STUDENT_ROLE"){
            return res.status(403).json({ 
                success: false, 
                message: "El usuario no es un estudiante" 
            })
        }
       
        const courses = await Course.find({ students: id })


        res.status(200).json({
            success: true,
            student: student.name,
            courses
        })

    }catch(error){
        res.status(500).json({ 
            success: false, 
            message: "Error al encontrar los cursos",
            error: error.message 
        })
    }
}

export const deleteStudentCourse = async(req, res) =>{
    try {
        const { id, courseId } = req.params

        const student = await User.findById(id)

        if(!student){
            return res.status(404).json({ 
                success: false, 
                message: "Estudiante no encontrado" 
            })
        }

        if(student.role !== "STUDENT_ROLE"){
            return res.status(403).json({ 
                success: false, 
                message: "El usuario no es un estudiante" 
            })
        }

        const course = await Course.findById(courseId)

        if(!course){
            return res.status(404).json({ 
                success: false, 
                message: "Curso no encontrado" 
            });
        }

        if(!course.students.includes(id)){
            return res.status(400).json({ 
                success: false, 
                message: "El estudiante no está asignado a este curso" 
            })
        }

        course.students = course.students.filter(idStudent => idStudent.toString() !== id)

        await course.save();

        res.status(200).json({
            success: true,
            message: "Estudiante eliminado del curso",
            course
        })

    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Error al eliminar al estudiante",
            error: error.message 
        })
    }
}


export const updateStudent = async (req, res) => {  
    try {
        const { uid } = req.params;
        const  data  = req.body;

        const user = await User.findByIdAndUpdate(uid, data, { new: true });

        res.status(200).json({
            success: true,
            msg: 'Estudiante Actualizado',
            user,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            msg: 'Error al actualizar el estudiante',
            error: err.message
        });
    }
}

export const deleteStudent = async(req, res) => {
    try{
        const { id } = req.params;

        const user = await User.findById(id)

        if(!user){
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        
        if(user.role === "STUDENT_ROLE"){
            await Course.updateMany(
                { students: id }, 
                { $pull: { students: id } }
            );
        }

        await User.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Estudiante eliminado",
            user
        });

    }catch(err){
        return res.status(500).json({
            success: false,
            message: "Error al eliminar el estudiante",
            error: err.message
        });
    }
}