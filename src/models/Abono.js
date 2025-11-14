import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Abono = sequelize.define('Abono', {
  venta_id: { type: DataTypes.INTEGER, allowNull: false },
  monto: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  fecha: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  usuario_id: { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: 'abonos',
  timestamps: true,
  paranoid: true
});

export default Abono;
