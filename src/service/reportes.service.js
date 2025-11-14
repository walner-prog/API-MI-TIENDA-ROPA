import { Venta, DetalleVenta, Gasto } from '../models/index.js'
import sequelize from '../config/database.js'
import { Op } from 'sequelize'

/**
 periodo: { desde: Date|string, hasta: Date|string }
 tipoVentas: 'todos'|'pagadas'|'pendientes'
*/
 
export async function calcularGananciasPeriodo({ desde, hasta, tipoVentas = 'pagadas' }) {
  const whereVenta = {}
  if (desde) whereVenta.fecha = { [Op.gte]: new Date(desde) }
  if (hasta) whereVenta.fecha = { ...whereVenta.fecha, [Op.lte]: new Date(hasta) }
  if (tipoVentas === 'pagadas') whereVenta.estado = 'pagado'
  if (tipoVentas === 'pendientes') whereVenta.estado = 'pendiente'

  // Obtener ventas y detalle para calcular costo y ventas usando alias
  const ventas = await Venta.findAll({
    where: whereVenta,
    include: [{ model: DetalleVenta, as: 'detalleVentas' }]
  })

  let ingresos = 0
  let costo_ventas = 0
  for (const v of ventas) {
    ingresos += Number(v.total)
    for (const dv of v.detalleVentas) { // <--- usar alias correcto
      costo_ventas += Number(dv.costo_unitario) * Number(dv.cantidad)
    }
  }

  // Gastos en periodo
  const gastos = await Gasto.findAll({
    where: {
      fecha: {
        [Op.between]: [desde ? new Date(desde) : new Date(0), hasta ? new Date(hasta) : new Date()]
      }
    }
  })
  const total_gastos = gastos.reduce((s, g) => s + Number(g.monto), 0)

  const utilidad_bruta = Number((ingresos - costo_ventas).toFixed(2))
  const utilidad_neta = Number((utilidad_bruta - total_gastos).toFixed(2))

  return { ingresos, costo_ventas, total_gastos, utilidad_bruta, utilidad_neta }
}

