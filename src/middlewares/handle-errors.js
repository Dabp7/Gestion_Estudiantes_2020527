export const handleErrors = (error, req, res, next) => {
    if (res.headersSent) return next(error)
    if (typeof error.array === 'function') return res.status(400).json({ success: false, errors: error.array().map(({ path, msg }) => ({ path, message: msg })) })
    if (error.code === 11000) return res.status(409).json({ success: false, message: 'El correo o username ya está registrado' })
    if (error.name === 'ValidationError' || error.name === 'CastError' || error.type === 'entity.parse.failed') return res.status(400).json({ success: false, message: 'Datos inválidos' })
    if (error.status && error.status >= 400 && error.status < 500) return res.status(error.status).json({ success: false, message: error.message })
    return res.status(500).json({ success: false, message: 'No se pudo completar la solicitud' })
}
