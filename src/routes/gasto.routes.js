import express from 'express'
import { registrarGasto } from '../controllers/gasto.controller.js'
import authMiddleware from '../middlewares/auth.js'

const router = express.Router()

router.post('/', authMiddleware, registrarGasto)
export default router
