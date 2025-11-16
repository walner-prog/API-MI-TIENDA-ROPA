import express from 'express'
import { registrarGasto,listarGastos } from '../controllers/gasto.controller.js'
import authMiddleware from '../middlewares/auth.js'

const router = express.Router()

router.post('/', authMiddleware, registrarGasto)
router.get('/', authMiddleware, listarGastos);
export default router
