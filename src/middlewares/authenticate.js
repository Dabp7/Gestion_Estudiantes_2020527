import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import User from '../user/user.model.js'

export async function authenticate(req, res, next) {
    const authorization = req.get('Authorization')
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : req.get('x-token')
    if (!token) return res.status(401).json({ success: false, message: 'Token requerido' })
    try {
        const payload = jwt.verify(token, process.env.SECRETORPRIVATEKEY, { algorithms: ['HS256'] })
        if (typeof payload === 'string' || !mongoose.isValidObjectId(payload.uid)) throw new Error('Invalid subject')
        const user = await User.findOne({ _id: payload.uid, status: true })
        if (!user) return res.status(401).json({ success: false, message: 'Sesión inválida' })
        req.user = user
        next()
    } catch { return res.status(401).json({ success: false, message: 'Token inválido o vencido' }) }
}
export const requireRole = role => (req, res, next) => req.user.role === role ? next() : res.status(403).json({ success: false, message: 'Rol no autorizado' })
export const requireSelf = param => (req, res, next) => req.user.id === req.params[param] ? next() : res.status(403).json({ success: false, message: 'Solo podés acceder a tu perfil' })
