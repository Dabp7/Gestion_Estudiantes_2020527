"use strict"

import User from '../user/user.model.js'
import Course from './courses.model.js'

export const createcourse = async (req, res) => {
    try {
        const data = req.body; // Extrae los datos del cuerpo de la petición
        const user = await User.findOne({ email: data.email }) // Busca un usuario por su email

        // Si no se encuentra el usuario, retorna un error 404
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuario no encontrado' 
            })
        }

        // Verifica si el usuario tiene el rol de profesor
        if (user.role !== "TEACHER_ROLE") {
            return res.status(403).json({ 
                success: false, 
                message: 'Únicamente los profesores pueden crear un curso' 
            })
        }

        // Crea una nueva instancia del modelo Course
        const course = new Course({
            ...data,
            teacher: user._id, // Asigna el ID del profesor al curso
            student: [] // Inicializa el array de estudiantes vacío
        })

        await course.save(); // Guarda el curso en la base de datos

        res.status(200).json({
            success: true,
            course // Devuelve el curso creado
        })

    } catch (error) {
        // Captura errores y responde con un error 500
        res.status(500).json({
            success: false,
            message: 'Error al crear el curso',
            error
        })
    }
}


export const getCourses = async (req, res) => {
    const { limite = 5, desde = 0 } = req.query; // Obtiene los parámetros de paginación
    const query = { status: true } // Define una consulta para obtener solo cursos activos

    try {
        // Busca cursos con la consulta definida y aplica paginación
        const courses = await Course.find(query)
            .skip(Number(desde)) // Salta los primeros 'desde' registros
            .limit(Number(limite)); // Limita el número de resultados

        const total = await Course.countDocuments(query); // Cuenta el total de cursos activos

        res.status(200).json({
            success: true,
            total, // Devuelve el total de cursos activos
            courses // Devuelve la lista de cursos obtenida
        })

    } catch (err) {
        // Captura errores y responde con un error 500
        res.status(500).json({
            success: false,
            message: 'Error al obtener todos los cursos',
            error: err.message
        })
    }
}

export const searchCourse = async (req, res) => {

    const { id } = req.params // Extrae el ID del curso desde los parámetros de la solicitud

    try {
        const course = await Course.findById(id) // Busca el curso en la base de datos por su ID

        if (!course) {
            return res.status(404).json({  // Si el curso no se encuentra, devuelve un error 404
                success: false, 
                message: 'Curso no encontrado' 
            })
        }
        
        res.status(200).json({ // Responde con el curso encontrado
            success: true,
            course: {
                ...course.toObject()
            },
        })

    } catch (err) {
        res.status(500).json({ // Maneja cualquier error interno del servidor
            success: false,
            message: 'Error al buscar el curso',
            error: err.message
        })
    }
}

export const updateCourse = async (req, res) => {
    try {
        const { uid } = req.params // Obtiene el ID del curso desde los parámetros
        const  data  = req.body // Obtiene los datos a actualizar desde el cuerpo de la solicitud

        const course = await Course.findByIdAndUpdate(uid, data, { new: true }); // Actualiza el curso y devuelve el nuevo estado

        res.status(200).json({ // Responde con éxito y el curso actualizado
            success: true,
            msg: 'Curso Actualizado',
            course,
        })
    } catch (err) {
        res.status(500).json({ // Maneja errores del servidor
            success: false,
            msg: 'Error al actualizar el curso',
            error: err.message
        })
    }
}

export const deleteCourse = async(req, res) =>{
    try {
        const { courseId, teacherId } = req.params // Extrae los IDs del curso y del profesor
        
        const course = await Course.findById(courseId) // Busca el curso por ID

        if(!course){
            return res.status(404).json({ // Si el curso no existe, devuelve error 404
                success: false,
                message: "Curso no encontrado"
            })
        }

        if(course.teacher.toString() !== teacherId){ // Verifica que el profesor sea el dueño del curso
            return res.status(403).json({
                success: false,
                message: "No tienes permiso para eliminar este curso"
            })
        }

        await User.updateMany( // Elimina el curso de la lista de los estudiantes inscritos
            { _id: { $in: course.students } },
            { $pull: { courses: courseId } } 
        )

        await Course.findByIdAndDelete(courseId); // Elimina el curso de la base de datos

        return res.status(200).json({ // Responde con éxito
            success: true,
            message: "Curso eliminado"
        })

    }catch(err){
        return res.status(500).json({ // Maneja errores internos del servidor
            success: false,
            message: "Error al eliminar el curso",
            error: err.message
        })
    }
}

