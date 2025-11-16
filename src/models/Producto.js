import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Producto = sequelize.define('Producto', {
  codigo_barras: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  nombre: { type: DataTypes.STRING(200), allowNull: false },
  precio_compra: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
  precio_venta: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
  stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  unidad: { type: DataTypes.STRING(20), allowNull: true },
  marca: { type: DataTypes.STRING(100), allowNull: true },
  utilidad: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 } // NUEVO CAMPO
}, {
  tableName: 'productos',
  timestamps: true,
  paranoid: true, // 🚀 Soft delete activado
  hooks: {
    // Antes de crear o actualizar, calculamos la utilidad automáticamente
    beforeCreate: (producto) => {
      producto.utilidad = producto.precio_venta - producto.precio_compra;
    },
    beforeUpdate: (producto) => {
      producto.utilidad = producto.precio_venta - producto.precio_compra;
    }
  }
});

export default Producto;
