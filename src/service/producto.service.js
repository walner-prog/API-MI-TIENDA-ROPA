import Producto from '../models/Producto.js'

export async function crearProductoService({ codigo_barras, nombre,marca, precio_compra = 0, precio_venta = 0, stock = 0 }) {
  if (!codigo_barras || !nombre) throw { status: 400, message: 'Código y nombre son requeridos' }

  const existe = await Producto.findOne({ where: { codigo_barras } })
  if (existe) throw { status: 409, message: 'Producto con ese código ya existe' }

  const producto = await Producto.create({
    codigo_barras, nombre, marca, precio_compra, precio_venta, stock
  })

  return { success: true, producto }
}

export async function actualizarProductoService(id, payload) {
  const producto = await Producto.findByPk(id)
  if (!producto) throw { status: 404, message: 'Producto no encontrado' }

  await producto.update(payload)
  return { success: true, producto }
}

export async function listarProductosService(query = {}) {
  const productos = await Producto.findAll({ where: query, order: [['id','ASC']] })
  return { success: true, productos }
}
