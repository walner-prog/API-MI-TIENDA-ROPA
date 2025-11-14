import express from 'express'
import { crearProducto, listarProductos ,actualizarProducto} from '../controllers/producto.controller.js'
import authMiddleware from '../middlewares/auth.js'

const router = express.Router()

router.post('/',authMiddleware, crearProducto)
router.get('/', listarProductos)
router.put('/:id', authMiddleware, actualizarProducto)

export default router
