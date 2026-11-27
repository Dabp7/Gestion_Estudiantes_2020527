import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { rateLimit } from 'express-rate-limit'
import { dbConnection } from './mongo.js'
import authRoutes from '../src/auth/auth.routes.js'
import courseRoutes from '../src/courses/courses.routes.js'
import studentRoutes from '../src/students/students.routes.js'
import teacherRoutes from '../src/teachers/teachers.routes.js'
import { handleErrors } from '../src/middlewares/handle-errors.js'

export const createApp = () => {
    const app = express()
    app.disable('x-powered-by')
    app.use(helmet())
    app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
    app.use(express.json({ limit: '32kb' }))
    if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'))
    app.get('/health', (req, res) => res.json({ success: true, status: 'ok' }))
    app.use('/gestionSystem/v1/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 50, standardHeaders: 'draft-7', legacyHeaders: false, message: { success: false, message: 'Demasiados intentos. Probá más tarde.' } }), authRoutes)
    app.use('/gestionSystem/v1/courses', courseRoutes)
    app.use('/gestionSystem/v1/students', studentRoutes)
    app.use('/gestionSystem/v1/teachers', teacherRoutes)
    app.use((req, res) => res.status(404).json({ success: false, message: 'Ruta no encontrada' }))
    app.use(handleErrors)
    return app
}
export const initServer = async () => {
    if (!process.env.SECRETORPRIVATEKEY || process.env.SECRETORPRIVATEKEY.length < 32) throw new Error('SECRETORPRIVATEKEY requiere al menos 32 caracteres')
    await dbConnection()
    const app = createApp()
    return app.listen(Number(process.env.PORT || 3006), '127.0.0.1', () => console.log(`API disponible en http://127.0.0.1:${process.env.PORT || 3006}`))
}
