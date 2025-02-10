"use strict"

import User from '../user/user.model.js'
import Course from '../courses/courses.model.js'

// Método para asignar un curso a un estudiante
export const addCourseStudent = async(req, res) =>{
    try {
        const { studentId } = req.body
        const { courseId } = req.params

        // Busca al curso por su id
        const course = await Course.findById(courseId)

        // Verifica si el curso existe
        if(!course){
            return res.status(404).json({ 
                success: false, 
                message: "Curso no encontrado" 
            })
        }

        // Busca la id del estudiante
        const student = await User.findById(studentId)

        // Valida que haya un estudiante y este tenga el rol de estudiante
        if(!student || student.role !== "STUDENT_ROLE"){
            return res.status(400).json({ 
                success: false, 
                message: "Solo estudiates pueden unirse a cursos" 
            })
        }
        
        // Verifica si el estudiante estaba inscrito desde antes al curso
        if(course.students.includes(studentId)){
            return res.status(400).json({ 
                success: false, 
                message: "El estudiante ya está inscrito en este curso" 
            })
        }

        // Busca todos los cursos en los que el estudiante está asignado usando su ID
        const cursosAsignados = await Course.find({ students: studentId })
    
        // Valida que el usuario no esté asignado a más de 3 cursos
        if(cursosAsignados.length >= 3){
            return res.status(400).json({ 
                success: false, 
                message: "No puede unirse a más de 3 cursos" 
            })
        }

        // Guarda al estudiante en el ultimo lugar del Array
        course.students.push(studentId);

        // Guarda los cambios
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
        const { id } = req.params // Obtiene el ID del estudiante desde los parámetros de la solicitud

        // Busca al estudiante en la base de datos usando su ID
        const student = await User.findById(id)

        // Si el estudiante no existe, retorna un error 404
        if(!student){
            return res.status(404).json({ 
                success: false, 
                message: "Estudiante no encontrado" 
            })
        }

        // Verifica que el usuario tenga el rol de estudiante
        if(student.role !== "STUDENT_ROLE"){
            return res.status(403).json({ 
                success: false, 
                message: "El usuario no es un estudiante" 
            })
        }
       
        // Busca los cursos en los que el estudiante está asignado
        const courses = await Course.find({ students: id })

        // Retorna una respuesta exitosa con el nombre del estudiante y sus cursos asignados
        res.status(200).json({
            success: true,
            student: student.name,
            courses
        })

    }catch(error){
        // Captura cualquier error y envía una respuesta de error 500
        res.status(500).json({ 
            success: false, 
            message: "Error al encontrar los cursos",
            error: error.message 
        })
    }
}

export const deleteStudentCourse = async(req, res) => {
    try {
        const { id, courseId } = req.params // Obtiene el ID del estudiante y del curso desde los parámetros de la solicitud

        // Busca al estudiante en la base de datos usando su ID
        const student = await User.findById(id)

        // Si el estudiante no existe, retorna un error 404
        if(!student){
            return res.status(404).json({ 
                success: false, 
                message: "Estudiante no encontrado" 
            })
        }

        // Verifica que el usuario tenga el rol de estudiante
        if(student.role !== "STUDENT_ROLE"){
            return res.status(403).json({ 
                success: false, 
                message: "El usuario no es un estudiante" 
            })
        }

        // Busca el curso en la base de datos usando su ID
        const course = await Course.findById(courseId)

        // Si el curso no existe, retorna un error 404
        if(!course){
            return res.status(404).json({ 
                success: false, 
                message: "Curso no encontrado" 
            });
        }

        // Verifica si el estudiante está asignado al curso
        if(!course.students.includes(id)){
            return res.status(400).json({ 
                success: false, 
                message: "El estudiante no está asignado a este curso" 
            })
        }

        // Filtra la lista de estudiantes del curso y elimina al estudiante específico
        course.students = course.students.filter(idStudent => idStudent.toString() !== id)

        // Guarda los cambios en la base de datos
        await course.save();

        // Retorna una respuesta exitosa indicando que el estudiante fue eliminado del curso
        res.status(200).json({
            success: true,
            message: "Estudiante eliminado del curso",
            course
        })

    } catch(error){
        // Captura cualquier error y envía una respuesta de error 500
        res.status(500).json({ 
            success: false, 
            message: "Error al eliminar al estudiante",
            error: error.message 
        })
    }
}

export const updateStudent = async (req, res) => {  
    try {
        const { uid } = req.params; // Obtiene el ID del estudiante desde los parámetros de la solicitud
        const  data  = req.body; // Obtiene los datos del cuerpo de la solicitud

        // Busca y actualiza al estudiante en la base de datos con los nuevos datos
        const user = await User.findByIdAndUpdate(uid, data, { new: true });

        // Retorna una respuesta exitosa con el estudiante actualizado
        res.status(200).json({
            success: true,
            msg: 'Estudiante Actualizado',
            user,
        });
    } catch (err) {
        // Captura cualquier error y envía una respuesta de error 500
        res.status(500).json({
            success: false,
            msg: 'Error al actualizar el estudiante',
            error: err.message
        });
    }
}

export const deleteStudent = async(req, res) => {
    try {
        const { id } = req.params; // Obtiene el ID del estudiante desde los parámetros de la solicitud

        // Busca al usuario en la base de datos usando su ID
        const user = await User.findById(id)

        // Si el usuario no existe, retorna un error 404
        if(!user){
            return res.status(404).json({
                success: false,
                message: "Usuario no encontrado"
            });
        }

        // Si el usuario es un estudiante, lo elimina de todos los cursos en los que esté asignado
        if(user.role === "STUDENT_ROLE"){
            await Course.updateMany(
                { students: id }, // Busca todos los cursos donde esté asignado el estudiante
                { $pull: { students: id } } // Lo elimina de la lista de estudiantes del curso
            );
        }

        // Elimina al estudiante de la base de datos
        await User.findByIdAndDelete(id);

        // Retorna una respuesta exitosa indicando que el estudiante fue eliminado
        return res.status(200).json({
            success: true,
            message: "Estudiante eliminado",
            user
        });

    }catch(err){
        // Captura cualquier error y envía una respuesta de error 500
        return res.status(500).json({
            success: false,
            message: "Error al eliminar el estudiante",
            error: err.message
        });
    }
}
