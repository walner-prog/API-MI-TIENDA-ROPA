import { Venta, DetalleVenta, Producto, Abono } from '../models/index.js'
import sequelize from '../config/database.js'

import { Op } from 'sequelize';
 
/**
 payload = {
   cliente_id (requerido si tipo_pago = 'credito'),
   tipo_pago: 'contado'|'credito',
   items: [{ producto_id, cantidad, precio_unitario }],
   impuesto: number (opcional),
   usuario_id (opcional),
   abono_inicial: number (opcional),
   plazo_dias: number (opcional, requerido para crédito),
   numero_abonos: number (opcional, requerido para crédito)
 }
*/
export async function crearVentaService(payload) {
  const { 
    items = [], 
    tipo_pago = 'contado', 
    cliente_id = null, 
    impuesto = 0, 
    usuario_id = null,
    abono_inicial = 0,
    plazo_dias = null,
    numero_abonos = null
  } = payload

  if (!Array.isArray(items) || items.length === 0)
    throw { status: 400, message: 'No hay items en la venta' }

  // Validaciones para crédito
  if (tipo_pago === 'credito') {
    if (!cliente_id) throw { status: 400, message: 'Se requiere un cliente para ventas a crédito' }
    if (!plazo_dias || plazo_dias <= 0) throw { status: 400, message: 'Se debe especificar el plazo de crédito en días' }
    if (!numero_abonos || numero_abonos <= 0) throw { status: 400, message: 'Se debe especificar el número de abonos' }
  }

  return await sequelize.transaction(async (t) => {
    let subtotal = 0
    let costo_total = 0
    let utilidad_total = 0
    const detalles = []

    // Validar stock y preparar detalles
    for (const it of items) {
      const producto = await Producto.findByPk(it.producto_id, { transaction: t })
      if (!producto) throw { status: 404, message: `Producto ID ${it.producto_id} no encontrado` }
      if (producto.stock < it.cantidad) throw { status: 400, message: `Stock insuficiente para ${producto.nombre}` }

      const precio_unitario = Number(it.precio_unitario ?? producto.precio_venta)
      const subtotal_item = Number((precio_unitario * it.cantidad).toFixed(2))
      const costo_item = Number((producto.precio_compra * it.cantidad).toFixed(2))
      const utilidad_real = subtotal_item - costo_item

      subtotal += subtotal_item
      costo_total += costo_item
      utilidad_total += utilidad_real

      detalles.push({ producto, cantidad: it.cantidad, precio_unitario, subtotal_item, costo_item, utilidad_real })
    }

    const impuesto_num = Number(impuesto || 0)
    const total = Number((subtotal + impuesto_num).toFixed(2))

    // Crear venta
    const venta = await Venta.create({
      cliente_id,
      subtotal,
      total,
      impuesto: impuesto_num,
      tipo_pago,
      estado: tipo_pago === 'contado' ? 'pagado' : 'pendiente',
      saldo_pendiente: tipo_pago === 'contado' ? 0 : total,
      utilidad_total,
      fecha: new Date(),
      usuario_id,
      plazo_dias,
      numero_abonos
    }, { transaction: t })

    // Crear detalles y descontar stock
    for (const d of detalles) {
      await DetalleVenta.create({
        venta_id: venta.id,
        producto_id: d.producto.id,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario,
        subtotal: d.subtotal_item,
        costo_unitario: d.producto.precio_compra,
        utilidad_real: d.utilidad_real
      }, { transaction: t })

      d.producto.stock -= d.cantidad
      await d.producto.save({ transaction: t })
    }

    // Registrar abono inicial si existe
    if (tipo_pago === 'credito' && Number(abono_inicial) > 0) {
      const montoNum = Number(abono_inicial)
      if (montoNum > venta.saldo_pendiente)
        throw { status: 400, message: 'El abono inicial excede el saldo' }

      const nuevoSaldo = Number((venta.saldo_pendiente - montoNum).toFixed(2))
      await Abono.create({
        venta_id: venta.id,
        monto: montoNum,
        usuario_id,
        fecha: new Date()
      }, { transaction: t })

      venta.saldo_pendiente = nuevoSaldo
      if (nuevoSaldo === 0) venta.estado = 'pagado'
      await venta.save({ transaction: t })
    }

    return { success: true, venta, utilidad_total }
  })
}



export async function listarVentasService(query = {}) {
  const where = {};

  // Filtrar por cliente, estado y tipo de pago
  if (query.cliente_id) where.cliente_id = query.cliente_id;
  if (query.estado) where.estado = query.estado;
  if (query.tipo_pago) where.tipo_pago = query.tipo_pago;

  // Filtrar por fecha
  let desde, hasta;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  desde = query.desde ? new Date(query.desde) : hoy;
  hasta = query.hasta ? new Date(query.hasta) : new Date();
  hasta.setHours(23, 59, 59, 999);

  where.fecha = { [Op.between]: [desde, hasta] };

  // Obtener ventas
  const ventas = await Venta.findAll({
    where,
    include: [
      {
        model: DetalleVenta,
        as: 'detalleVentas',
        include: [
          { model: Producto, as: 'producto', attributes: ['id', 'nombre', 'codigo_barras'] }
        ]
      },
      { model: Abono, as: 'abonos' }
    ],
    order: [['fecha', 'DESC']]
  });

  // Totales por estado dinámicos
  const totalesEstado = {};
  for (const v of ventas) {
    if (!totalesEstado[v.estado]) totalesEstado[v.estado] = 0;
    totalesEstado[v.estado] += parseFloat(v.total);
  }

  // Mapear ventas para respuesta clara
  const resultado = ventas.map(v => ({
    id: v.id,
    cliente_id: v.cliente_id,
    subtotal: parseFloat(v.subtotal),
    total: parseFloat(v.total),
    impuesto: parseFloat(v.impuesto),
    tipo_pago: v.tipo_pago,
    estado: v.estado,
    saldo_pendiente: parseFloat(v.saldo_pendiente),
    utilidad_total: parseFloat(v.utilidad_total),
    fecha: v.fecha,
    plazo_dias: v.plazo_dias,
    numero_abonos: v.numero_abonos,
    detalles: v.detalleVentas.map(d => ({
      producto_id: d.producto_id,
      nombre_producto: d.producto?.nombre || '',
      codigo_barras: d.producto?.codigo_barras || '',
      cantidad: d.cantidad,
      precio_unitario: parseFloat(d.precio_unitario),
      costo_unitario: parseFloat(d.costo_unitario),
      subtotal: parseFloat(d.subtotal),
      utilidad_real: parseFloat(d.utilidad_real)
    })),
    abonos: v.abonos.map(a => ({
      id: a.id,
      monto: parseFloat(a.monto),
      usuario_id: a.usuario_id,
      fecha: a.fecha
    }))
  }));

  return { success: true, ventas: resultado, totalesEstado };
}



export async function eliminarVentaService(ventaId) {
  return await sequelize.transaction(async (t) => {
    const venta = await Venta.findByPk(ventaId, { transaction: t })
    if (!venta) throw { status: 404, message: 'Venta no encontrada' }
    if (venta.estado === 'anulado') throw { status: 400, message: 'Venta ya está anulada' }

    // Obtener detalles de la venta
    const detalles = await DetalleVenta.findAll({ where: { venta_id: venta.id }, transaction: t })

    // Devolver stock de los productos
    for (const d of detalles) {
      const producto = await Producto.findByPk(d.producto_id, { transaction: t })
      if (producto) {
        producto.stock += d.cantidad
        await producto.save({ transaction: t })
      }
    }

    // Soft delete de abonos
    await Abono.destroy({ where: { venta_id: venta.id }, transaction: t })

    // Soft delete de detalles de venta
    await DetalleVenta.destroy({ where: { venta_id: venta.id }, transaction: t })

    // Anular la venta (soft delete)
    venta.estado = 'anulado'
    venta.saldo_pendiente = 0
    await venta.save({ transaction: t })

    return { success: true, message: 'Venta anulada correctamente', venta }
  })
}



/**
 * Registrar un abono para ventas a crédito
 */
export async function registrarAbonoService(ventaId, { monto, usuario_id = null }) {
  if (!monto || Number(monto) <= 0) throw { status: 400, message: 'Monto inválido' }

  return await sequelize.transaction(async (t) => {
    const venta = await Venta.findByPk(ventaId, { transaction: t })
    if (!venta) throw { status: 404, message: 'Venta no encontrada' }
    if (venta.estado === 'anulado') throw { status: 400, message: 'Venta anulada' }
    if (venta.tipo_pago !== 'credito') throw { status: 400, message: 'Venta no es a crédito' }

    // Validar número máximo de abonos
    const abonosRegistrados = await Abono.count({ where: { venta_id: venta.id }, transaction: t })
    if (venta.numero_abonos && abonosRegistrados >= venta.numero_abonos)
      throw { status: 400, message: 'Se alcanzó el número máximo de abonos' }

    const montoNum = Number(monto)
    const nuevoSaldo = Number((Number(venta.saldo_pendiente) - montoNum).toFixed(2))
    if (nuevoSaldo < 0)
      throw { status: 400, message: 'El abono excede el saldo pendiente' }

    // Crear abono
    const abono = await Abono.create({
      venta_id: venta.id,
      monto: montoNum,
      usuario_id,
      fecha: new Date()
    }, { transaction: t })

    venta.saldo_pendiente = nuevoSaldo
    if (nuevoSaldo === 0) venta.estado = 'pagado'
    await venta.save({ transaction: t })

    return { success: true, abono, venta }
  })
}

