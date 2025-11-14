import * as productoService from '../service/producto.service.js'

export const crearProducto = async (req, res) => {
  try {
    const result = await productoService.crearProductoService(req.body)
    res.json(result)
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' })
  }
}

export const listarProductos = async (req, res) => {
  try {
    const result = await productoService.listarProductosService()
    res.json(result)
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' })
  }
}

export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params
    const result = await productoService.actualizarProductoService(id, req.body)
    res.json(result)
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' })
  }
}
