import * as reporteService from '../service/reportes.service.js';

/**
 * req.query:
 *   desde: string (fecha inicio)
 *   hasta: string (fecha fin)
 *   tipoVentas: 'todos'|'pagadas'|'pendientes'
 */
export const calcularGananciasPeriodo = async (req, res) => {
  try {
    const { desde, hasta, tipoVentas } = req.query;
    const resultado = await reporteService.calcularGananciasPeriodo({ desde, hasta, tipoVentas });
    res.json({ success: true, ...resultado });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error interno'
    });
  }
};
