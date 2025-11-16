import * as gastoService from '../service/gasto.service.js'

export const registrarGasto = async (req, res) => {
  try {
    const result = await gastoService.registrarGastoService(req.body)
    res.json(result)
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' })
  }
}

export const listarGastos = async (req, res) => {
  try {
    const result = await gastoService.listarGastosService();
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' });
  }
};
