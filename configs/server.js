"use strict"

import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import { dbConnection } from "./mongo.js"
import authRoutes from "../src/auth/auth.routes.js"
import courseRoutes from "../src/courses/courses.routes.js"
import studentRoutes from "../src/students/students.routes.js"
import teacherRoutes from "../src/teachers/teachers.routes.js"

const middlewares = (app) => {
    app.use(express.json())
    app.use(cors())
    app.use(helmet())
    app.use(morgan("dev"))
}

// Configuración de rutas
const routes = (app) =>{
    app.use("/gestionSystem/v1/auth", authRoutes)
    app.use("/gestionSystem/v1/courses", courseRoutes)
    app.use("/gestionSystem/v1/students", studentRoutes)
    app.use("/gestionSystem/v1/teachers", teacherRoutes)
}

// Conexión a la base de datos
const conectarDB = async () =>{
    try{
        await dbConnection()
    }catch(err){
        console.log(`Database connection failed: ${err}`)
        process.exit(1)
    }
}

export const initServer = () => {
    const app = express()
    try{
        middlewares(app)
        conectarDB()
        routes(app)
        app.listen(process.env.PORT)
        console.log(`Server running on port ${process.env.PORT}`)
    }catch(err){
        console.log(`Server init failed: ${err}`)
    }
}

