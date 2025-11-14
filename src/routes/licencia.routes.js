import express from 'express'
import {
  activarLicencia,
  crearLicencia,
  listarLicencias,
  liberarLicencia,
  actualizarLicencia,
   
} from '../controllers/licencia.controller.js'

import { verificarToken, esAdmin } from '../middlewares/auth.js';

const router = express.Router()

router.post('/activar', activarLicencia)        // para Electron

router.post('/crear', verificarToken, esAdmin, crearLicencia)            // admin
router.get('/listar', verificarToken, esAdmin, listarLicencias)          // admin
router.put('/liberar/:id', verificarToken, esAdmin, liberarLicencia)     // admin
router.put('/:id', verificarToken, esAdmin, actualizarLicencia); // admin

export default router
