import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const DetalleVenta = sequelize.define('DetalleVenta', {
  venta_id: { type: DataTypes.INTEGER, allowNull: false },
  producto_id: { type: DataTypes.INTEGER, allowNull: false },
  cantidad: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
  precio_unitario: { type: DataTypes.DECIMAL(12,2), allowNull: false }, // precio de venta al momento
  costo_unitario: { type: DataTypes.DECIMAL(12,2), allowNull: false }, // precio de compra al momento
  subtotal: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  utilidad_real: { type: DataTypes.DECIMAL(12,2), allowNull: false } // ganancia real por esta venta
}, {
  tableName: 'detalle_ventas',
  timestamps: true,
  paranoid: true, // soft delete
  hooks: {
    beforeCreate: (detalle) => {
      // subtotal = cantidad * precio_unitario
      detalle.subtotal = detalle.cantidad * detalle.precio_unitario;
      // utilidad_real = (precio_unitario - costo_unitario) * cantidad
      detalle.utilidad_real = (detalle.precio_unitario - detalle.costo_unitario) * detalle.cantidad;
    },
    beforeUpdate: (detalle) => {
      detalle.subtotal = detalle.cantidad * detalle.precio_unitario;
      detalle.utilidad_real = (detalle.precio_unitario - detalle.costo_unitario) * detalle.cantidad;
    }
  }
});

export default DetalleVenta;
