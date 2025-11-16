import Gasto from '../models/Gasto.js'

export async function registrarGastoService({ descripcion, monto, categoria = null, usuario_id = null }) {
  if (!descripcion || !monto) throw { status: 400, message: 'Descripción y monto son requeridos' }
  const gasto = await Gasto.create({ descripcion, monto, categoria, usuario_id, fecha: new Date() })
  return { success: true, gasto }
}

export async function listarGastosService() {
  const gastos = await Gasto.findAll({ order: [['fecha', 'DESC']] });
  return { success: true, gastos };
}

