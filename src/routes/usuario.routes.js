import { Router } from 'express';
import * as usuarioController from '../controllers/usuario.controller.js';
import authMiddleware from '../middlewares/auth.js'
import esAdmin from '../middlewares/auth.js'
const router = Router();


// GET /api/usuarios
router.get('/', authMiddleware, usuarioController.listarUsuarios);

// POST /api/usuarios/registro
router.post('/registro',  usuarioController.registrarUsuario);

// POST /api/usuarios/login
router.post('/login', usuarioController.loginUsuario);
 
// Actualizar perfil
router.put('/:id', usuarioController.actualizarUsuario);
// Obtener perfil del usuario logueado
router.get('/perfil/miperfil',authMiddleware, usuarioController.perfilUsuario);

 router.delete('/eliminar/:id', authMiddleware, esAdmin, usuarioController.eliminarUsuario);


export default router;
