import express from 'express'
import { crearVenta, registrarAbono,listarVentas ,eliminarVenta,listarVentasPorClienteController,obtenerDetalleVentaController} from '../controllers/venta.controller.js'
import authMiddleware from '../middlewares/auth.js'

const router = express.Router()
router.get('/',authMiddleware, listarVentas)
router.post('/', authMiddleware, crearVenta) // crear venta con items
router.delete('/:id', authMiddleware, eliminarVenta)
router.get("/cliente/:id", listarVentasPorClienteController);
router.get("/:id", obtenerDetalleVentaController);
router.post('/:id/abonos', authMiddleware, registrarAbono) // registrar abono para venta a credito


export default router
 