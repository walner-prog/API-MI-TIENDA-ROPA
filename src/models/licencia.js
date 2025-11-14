import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Licencia = sequelize.define('Licencia', {
  licencia_key: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  cliente_nombre: {
    type: DataTypes.STRING
  },
  machine_id: {
    type: DataTypes.STRING
  },
  estado: {
    type: DataTypes.ENUM('activa', 'suspendida', 'expirada'),
    defaultValue: 'activa'
  },
  tipo: {
    type: DataTypes.ENUM('normal', 'trial'),
    defaultValue: 'normal'
  },
  activada_en: {
    type: DataTypes.DATE
  },
  expira_en: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'licencias',
  timestamps: true,
  createdAt: 'creada_en',
  updatedAt: false
})

export default Licencia
