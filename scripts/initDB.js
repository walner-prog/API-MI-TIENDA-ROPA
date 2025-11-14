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
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

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
    { nombre: 'Cliente 1', telefono: '10000001' },
    { nombre: 'Cliente 2', telefono: '10000002' },
    { nombre: 'Cliente 3', telefono: '10000003' },
    { nombre: 'Cliente 4', telefono: '10000004' },
    { nombre: 'Cliente 5', telefono: '10000005' }
  ], { ignoreDuplicates: true });
  console.log('🟢 Clientes insertados');

  // =============================
  // 👉 Productos (utilidad calculada automáticamente)
  // =============================
  await Producto.bulkCreate([
    { nombre: 'Producto 1', codigo_barras: '0001', precio_compra: 10, precio_venta: 15, stock: 50 },
    { nombre: 'Producto 2', codigo_barras: '0002', precio_compra: 20, precio_venta: 30, stock: 40 },
    { nombre: 'Producto 3', codigo_barras: '0003', precio_compra: 5, precio_venta: 8, stock: 100 },
    { nombre: 'Producto 4', codigo_barras: '0004', precio_compra: 12, precio_venta: 18, stock: 60 },
    { nombre: 'Producto 5', codigo_barras: '0005', precio_compra: 7, precio_venta: 12, stock: 80 }
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
