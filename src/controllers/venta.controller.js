import * as ventaService from '../service/venta.service.js'

export const crearVenta = async (req, res) => {
  try {
    const result = await ventaService.crearVentaService(req.body) 
    res.json(result)
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' })
  }
}

export const registrarAbono = async (req, res) => {
  try {
    const { id } = req.params
    const result = await ventaService.registrarAbonoService(id, req.body)
    res.json(result)
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' })
  }
}


export const listarVentas = async (req, res) => {
  try {
    const query = req.query // permite filtrar: cliente_id, estado, tipo_pago
    const result = await ventaService.listarVentasService(query)
    res.json(result)
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' })
  }
}

export const eliminarVenta = async (req, res) => {
  const { id } = req.params
  try {
    const result = await ventaService.eliminarVentaService(id)
    res.json(result)
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error interno'
    })
  }
}



export async function listarVentasPorClienteController(req, res) {
  try {
    const { id } = req.params;
    const ventas = await ventaService.listarVentasPorClienteService(id);
    res.json({ success: true, ventas });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
}

export async function obtenerDetalleVentaController(req, res) {
  try {
    const { id } = req.params;
    const venta = await ventaService.obtenerDetalleVentaService(id);
    res.json({ success: true, venta });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message
    });
  }
}

