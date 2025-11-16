// scripts/initDB.js
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

import { sequelize, Cliente, Producto } from '../src/models/index.js';
import Usuario from '../src/models/Usuario.js';

async function createDatabase() {
  const { MYSQLHOST, MYSQLPORT, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE } = process.env;

  console.log('⏳ Verificando base de datos...');

  const connection = await mysql.createConnection({
    host: MYSQLHOST,
    port: MYSQLPORT,
    user: MYSQLUSER,
    password: MYSQLPASSWORD
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQLDATABASE}\`;`);
  console.log(`✅ Base de datos "${MYSQLDATABASE}" lista`);
  await connection.end();
}

async function populateData() {
  console.log('⏳ Poblando datos iniciales...');

  // =============================
  // 👉 Crear usuarios
  // =============================
  const adminPassword = await bcrypt.hash('admin', 10);
  const userPassword = await bcrypt.hash('user', 10);

  const [admin, adminCreated] = await Usuario.findOrCreate({
    where: { email: 'admin@admin.com' },
    defaults: { nombre: 'Admin', passwordHash: adminPassword, rol: 'admin', username: 'admin' }
  });
  console.log(adminCreated ? '🟢 Usuario admin creado' : '⚠️ Usuario admin ya existía');

  const [user, userCreated] = await Usuario.findOrCreate({
    where: { email: 'user@user.com' },
    defaults: { nombre: 'Usuario', passwordHash: userPassword, rol: 'user', username: 'user' }
  });
  console.log(userCreated ? '🟢 Usuario normal creado' : '⚠️ Usuario normal ya existía');

  // =============================
  // 👉 Clientes
  // =============================
  await Cliente.bulkCreate([
    { nombre: 'Jose Perez ', telefono: '10000001' },
    { nombre: 'Maria Lopez', telefono: '10000002' },
    { nombre: 'Carlos Sanchez', telefono: '10000003' },
    { nombre: 'Luis Martinez', telefono: '10000004' },
    { nombre: 'Maria Gomez', telefono: '10000005' }
  ], { ignoreDuplicates: true });
  console.log('🟢 Clientes insertados');

  // =============================
  // 👉 Productos (utilidad calculada automáticamente)
  // =============================
  await Producto.bulkCreate([
  { nombre: 'Camiseta Básica (Algodón)', codigo_barras: '0001', precio_compra: 8, precio_venta: 12, stock: 80, marca: 'Hanes' },
  { nombre: 'Pantalón Jean (Mezclilla)', codigo_barras: '0002', precio_compra: 20, precio_venta: 30, stock: 50, marca: 'Wrangler' },
  { nombre: 'Camisa Formal (Manga Larga)', codigo_barras: '0003', precio_compra: 22, precio_venta: 35, stock: 40, marca: 'Perry Ellis' },
  { nombre: 'Vestido Casual de Verano', codigo_barras: '0004', precio_compra: 18, precio_venta: 28, stock: 30, marca: 'Sin Marca' },
  { nombre: 'Pantalón Corto (Bermuda)', codigo_barras: '0005', precio_compra: 15, precio_venta: 22, stock: 60, marca: 'Columbia (Réplica)' },
  { nombre: 'Falda de Jean', codigo_barras: '0006', precio_compra: 16, precio_venta: 25, stock: 35, marca: 'Sin Marca' },
  { nombre: 'Suéter Ligero (Hoddie)', codigo_barras: '0007', precio_compra: 19, precio_venta: 30, stock: 25, marca: 'Nike' },
  { nombre: 'Blusa Elegante (Mujer)', codigo_barras: '0008', precio_compra: 14, precio_venta: 22, stock: 40, marca: 'Zara' },
  { nombre: 'Gorra (Logo)', codigo_barras: '0009', precio_compra: 7, precio_venta: 12, stock: 100, marca: 'Polo' },
  { nombre: 'Par de Calcetines (Deportivos)', codigo_barras: '0010', precio_compra: 3, precio_venta: 5, stock: 150, marca: 'FOTL' },
  { nombre: 'Boxer (Ropa Interior Hombre)', codigo_barras: '0011', precio_compra: 5, precio_venta: 8, stock: 90, marca: 'Hanes' },
  { nombre: 'Zapatos Deportivos (Tenis)', codigo_barras: '0012', precio_compra: 30, precio_venta: 45, stock: 20, marca: 'Puma' },
  { nombre: 'Sandalias de Cuero', codigo_barras: '0013', precio_compra: 12, precio_venta: 20, stock: 45, marca: 'El Potro (Local)' },
  { nombre: 'Pantalón de Vestir (Hombre)', codigo_barras: '0014', precio_compra: 25, precio_venta: 40, stock: 30, marca: 'Sin Marca' },
  { nombre: 'Chaqueta Rompevientos', codigo_barras: '0015', precio_compra: 28, precio_venta: 42, stock: 25, marca: 'The North Face' }
], { ignoreDuplicates: true, individualHooks: true });
  console.log('🟢 Productos insertados con utilidad calculada correctamente');

  console.log('🎉 Base de datos inicializada correctamente');
}

async function init() {
  try {
    await createDatabase();

    await sequelize.authenticate();
    console.log('🔗 Conexión establecida con Sequelize');

    // 👇 Sincroniza todos los modelos con fuerza (solo para desarrollo)
    await sequelize.sync({ force: true });
    console.log('🛠️ Tablas sincronizadas');

    await populateData();
  } catch (err) {
    console.error('❌ Error inicializando BD:', err);
  } finally {
    process.exit(0);
  }
}

init();
