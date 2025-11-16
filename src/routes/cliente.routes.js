import { Router } from 'express';
import {
  crearCliente,
  listarClientes,
  obtenerCliente,
  eliminarCliente,
  listarClientesCreditoController,
  listarClientesConDeudaController
} from '../controllers/cliente.controller.js';
import authMiddleware from '../middlewares/auth.js'

const router = Router();

router.post('/',authMiddleware, crearCliente);         // Crear cliente
router.get('/', listarClientes);        // Listar todos los clientes
router.get('/:id', obtenerCliente);     // Obtener cliente por ID
router.delete('/:id', authMiddleware, eliminarCliente); // Eliminar cliente (soft delete)
router.get('/credito/deben', listarClientesCreditoController)
router.get("/credito/deben/clientes", listarClientesConDeudaController);

export default router;
