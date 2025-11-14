import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Gasto = sequelize.define('Gasto', {
  descripcion: { type: DataTypes.STRING(255), allowNull: false },
  monto: { type: DataTypes.DECIMAL(12,2), allowNull: false },
  fecha: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  categoria: { type: DataTypes.STRING(100), allowNull: true },
  usuario_id: { type: DataTypes.INTEGER, allowNull: true }
}, {
  tableName: 'gastos',
  timestamps: true,
  paranoid: true
});

export default Gasto;
