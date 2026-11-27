import mongoose from 'mongoose'
export const dbConnection = async () => {
    if (!process.env.URI_MONGO) throw new Error('URI_MONGO requerida; usar MongoDB replica set para transacciones')
    await mongoose.connect(process.env.URI_MONGO, { serverSelectionTimeoutMS: 10000, maxPoolSize: 20 })
    const hello = await mongoose.connection.db.admin().command({ hello: 1 })
    if (!hello.setName && hello.msg !== 'isdbgrid') { await mongoose.disconnect(); throw new Error('Se requiere un replica set de MongoDB para proteger inscripciones concurrentes') }
}
