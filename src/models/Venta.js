import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Venta = sequelize.define('Venta', {
  cliente_id: { type: DataTypes.INTEGER, allowNull: true },
  total: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
  subtotal: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
  utilidad_total: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
  impuesto: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
  tipo_pago: { type: DataTypes.ENUM('contado', 'credito'), allowNull: false, defaultValue: 'contado' },
  estado: { type: DataTypes.ENUM('pendiente','pagado','anulado'), allowNull: false, defaultValue: 'pagado' },
  saldo_pendiente: { type: DataTypes.DECIMAL(12,2), allowNull: false, defaultValue: 0 },
  fecha: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  usuario_id: { type: DataTypes.INTEGER, allowNull: true },
  plazo_dias: { type: DataTypes.INTEGER, allowNull: true },       // ⬅ tiempo para pagar
  numero_abonos: { type: DataTypes.INTEGER, allowNull: true }    // ⬅ cantidad de pagos permitidos
}, {
  tableName: 'ventas',
  timestamps: true,
  paranoid: true
});


export default Venta;
