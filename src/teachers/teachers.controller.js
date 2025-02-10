import Course from "../courses/courses.model.js";
import User from "../user/user.model.js"

// Método para obtener profesores y sus cursos
export const getCoursesTeacher = async(req, res) =>{
    try {
        
        // Guarda la id que pude en la URL
        const { uid } = req.params
        const { limite = 5, desde = 0 } = req.query

        // Busca la ID del usuario que fue proporcinado en la URL
        const user = await User.findById(uid)

        // Validación para asegurarse que el usuario no venga vacío o que el usuario sea un profesor
        if(!user || user.role !== "TEACHER_ROLE"){
            return res.status(404).json({
                success: false,
                message: "Profesor no encontrado"
            })
        }
        // Encuentra la cantidad de cursos asociados y los guarda
        const [total, courses] = await Promise.all([
            Course.countDocuments({ teacher: uid }),
            Course.find({ teacher: uid })
                .skip(Number(desde))
                .limit(Number(limite))
        ])

        return res.status(200).json({
            success: true,
            total, 
            teacher:{
                id: user._id,
                name: user.name,
                email: user.email
            },
            courses 
        })

    } catch(err){
        return res.status(500).json({
            success: false,
            message: "Error al obtener los cursos del profesor asignado",
            error: err.message
        })
    }
}
