import 'dotenv/config'
import mongoose from 'mongoose'
import { hash } from 'argon2'
import { dbConnection } from '../configs/mongo.js'
import User from '../src/user/user.model.js'
import Course from '../src/courses/courses.model.js'

// The command only operates on a visibly named demo database; it never clears data.
const dbName = new URL(process.env.URI_MONGO?.replace(/^mongodb:/, 'http:') || 'http://invalid').pathname.slice(1)
if (!dbName.endsWith('_demo')) throw new Error('El seed exige una base terminada en _demo; no modifica una base existente de otro entorno')
await dbConnection()
try {
    await User.init(); await Course.init()
    const password = await hash('DemoOnly!2026')
    for (const [username, role] of [['teacher_demo', 'TEACHER_ROLE'], ['teacher_other', 'TEACHER_ROLE'], ['student_demo', 'STUDENT_ROLE']]) {
        await User.updateOne({ username }, { $setOnInsert: { username, name: username, email: `${username}@example.test`, password, phone: '55550000', role, status: true } }, { upsert: true })
    }
    const teacher = await User.findOne({ username: 'teacher_demo' })
    for (const name of ['Matemática demo', 'Programación demo', 'Datos demo', 'Redes demo']) await Course.updateOne({ name, teacher: teacher._id }, { $setOnInsert: { name, description: 'Contenido académico ficticio', teacher: teacher._id, students: [], status: true } }, { upsert: true })
    console.log('Seed listo: teacher_demo@example.test, teacher_other@example.test, student_demo@example.test / clave ficticia DemoOnly!2026')
} finally { await mongoose.disconnect() }
