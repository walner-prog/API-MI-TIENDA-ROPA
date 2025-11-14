import sequelize from '../config/database.js'
import Cliente from './Cliente.js'
import Producto from './Producto.js'
import Venta from './Venta.js'
import DetalleVenta from './DetalleVenta.js'
import Gasto from './Gasto.js'
import Abono from './Abono.js'

// Relaciones
// Relaciones con alias
Cliente.hasMany(Venta, { foreignKey: 'cliente_id', as: 'ventas' })
Venta.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' })

Venta.hasMany(DetalleVenta, { foreignKey: 'venta_id', as: 'detalleVentas' })
DetalleVenta.belongsTo(Venta, { foreignKey: 'venta_id' })

Producto.hasMany(DetalleVenta, { foreignKey: 'producto_id', as: 'detalleVentas' })
DetalleVenta.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' })

Venta.hasMany(Abono, { foreignKey: 'venta_id', as: 'abonos' })
Abono.belongsTo(Venta, { foreignKey: 'venta_id' })


export {
  sequelize,
  Cliente,
  Producto,
  Venta,
  DetalleVenta,
  Gasto,
  Abono
}
