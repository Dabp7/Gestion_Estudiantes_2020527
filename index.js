import { config } from "dotenv"
import { initServer } from "./configs/server.js"

config()
initServer().catch(() => { console.error('No se pudo iniciar la API; revisá la configuración local y el replica set'); process.exitCode = 1 })
