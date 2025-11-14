import { Router } from 'express';
import * as reporteController from '../controllers/reporte.controller.js';

const router = Router();

// GET /api/reportes/ganancias?desde=2025-01-01&hasta=2025-12-31&tipoVentas=pagadas
router.get('/ganancias', reporteController.calcularGananciasPeriodo);

export default router;
