 

import { Op } from 'sequelize';
import { Cliente, Venta, DetalleVenta, Producto, Abono } from '../models/index.js';


export async function crearClienteService(data) {
  if (!data.nombre) throw { status: 400, message: 'El nombre es obligatorio' };
  const cliente = await Cliente.create(data);
  return { success: true, cliente };
}

export async function listarClientesService() {
  const clientes = await Cliente.findAll({ order: [['id', 'ASC']] });
  return { success: true, clientes };
}

export async function obtenerClienteService(id) {
  const cliente = await Cliente.findByPk(id);
  if (!cliente) throw { status: 404, message: 'Cliente no encontrado' };
  return { success: true, cliente };
}

export async function eliminarClienteService(id) {
  const cliente = await Cliente.findByPk(id);
  if (!cliente) throw { status: 404, message: 'Cliente no encontrado' };

  // Verificar si el cliente tiene ventas
  const ventas = await Venta.findAll({ where: { cliente_id: id } });
  if (ventas.length > 0) {
    throw { status: 400, message: 'No se puede eliminar: el cliente tiene ventas registradas' };
  }

  await cliente.destroy(); // soft delete
  return { success: true, message: 'Cliente eliminado correctamente', clienteId: id };
}


/**
 * Listar clientes con ventas a crédito
 * @param {Object} query - { estado, desde, hasta, page }
 */
export async function listarClientesCreditoService(query = {}) {
  const { estado, desde, hasta, page = 1 } = query;
  const limit = 500;
  const offset = (page - 1) * limit;

  // Filtrar ventas a crédito
  const fechaDesde = desde ? new Date(desde) : new Date(new Date().setHours(0,0,0,0));
  const fechaHasta = hasta ? new Date(hasta) : new Date();
  fechaHasta.setHours(23,59,59,999);

  // Primero, obtener clientes que tengan ventas a crédito con el filtro de estado y fecha
  const ventasCredito = await Venta.findAll({
    where: {
      tipo_pago: 'credito',
      ...(estado && { estado }),
      fecha: { [Op.between]: [fechaDesde, fechaHasta] }
    },
    include: [
      {
        model: Cliente,
        as: 'cliente'
      },
      {
        model: DetalleVenta,
        as: 'detalleVentas',
        include: [
          { model: Producto, as: 'producto', attributes: ['id','nombre','codigo_barras'] }
        ]
      },
      { model: Abono, as: 'abonos' }
    ],
    order: [['fecha', 'DESC']],
    limit,
    offset
  });

  // Agrupar por cliente
  const clientesMap = new Map();
  let totalSaldoPendiente = 0;

  for (const venta of ventasCredito) {
    const clienteId = venta.cliente_id;
    if (!clientesMap.has(clienteId)) {
      clientesMap.set(clienteId, {
        cliente_id: clienteId,
        nombre: venta.cliente?.nombre || 'Sin nombre',
        total_credito: 0,
        ventas: []
      });
    }

    const clienteData = clientesMap.get(clienteId);
    clienteData.ventas.push({
      id: venta.id,
      subtotal: parseFloat(venta.subtotal),
      total: parseFloat(venta.total),
      saldo_pendiente: parseFloat(venta.saldo_pendiente),
      estado: venta.estado,
      fecha: venta.fecha,
      plazo_dias: venta.plazo_dias,
      numero_abonos: venta.numero_abonos,
      detalles: venta.detalleVentas.map(d => ({
        producto_id: d.producto_id,
        nombre_producto: d.producto?.nombre || '',
        codigo_barras: d.producto?.codigo_barras || '',
        cantidad: d.cantidad,
        precio_unitario: parseFloat(d.precio_unitario),
        costo_unitario: parseFloat(d.costo_unitario),
        subtotal: parseFloat(d.subtotal),
        utilidad_real: parseFloat(d.utilidad_real)
      })),
      abonos: venta.abonos.map(a => ({
        id: a.id,
        monto: parseFloat(a.monto),
        usuario_id: a.usuario_id,
        fecha: a.fecha
      }))
    });

    clienteData.total_credito += parseFloat(venta.saldo_pendiente);
    totalSaldoPendiente += parseFloat(venta.saldo_pendiente);
  }

  const clientes = Array.from(clientesMap.values());
  const totalClientes = clientes.length;

  return {
    success: true,
    clientes,
    totalClientes,
    totalSaldoPendiente
  };
}


// SOLO clientes con ventas a crédito Y saldo pendiente mayor a 0
export async function listarClientesConDeudaService() {
    const clientes = await Cliente.findAll({
        attributes: ["id", "nombre", "telefono", "direccion"],
        include: [
            {
                model: Venta,
                as: "ventas",
                where: {
                    tipo_pago: "credito",
                    estado: { [Op.ne]: "anulado" },
                    saldo_pendiente: { [Op.gt]: 0 }
                },
                required: true // ⬅ IMPORTANTE: fuerza a traer solo clientes que cumplan
            }
        ],
        order: [["nombre", "ASC"]]
    });

    return clientes;
}
