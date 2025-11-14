import Usuario from '../models/Usuario.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10;

/**
 * Registrar usuario
 */
export async function registerUsuarioService({ email, username, password, nombre, rol = 'user' }) {
  if (!email || !username || !password) throw { status: 400, message: 'Faltan datos obligatorios' };

  const existe = await Usuario.findOne({ where: { email } });
  if (existe) throw { status: 400, message: 'Email ya registrado' };

  const existeUser = await Usuario.findOne({ where: { username } });
  if (existeUser) throw { status: 400, message: 'Username ya registrado' };

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const usuario = await Usuario.create({ email, username, nombre, passwordHash, rol });

  return usuario;
}

/**
 * Login usuario
 */
export async function loginUsuarioService({ username, password }) {
  if (!username || !password) throw { status: 400, message: 'Faltan username o password' };

  const usuario = await Usuario.findOne({ where: { username } });
  if (!usuario) throw { status: 404, message: 'Usuario no encontrado' };

  const valido = await bcrypt.compare(password, usuario.passwordHash);
  if (!valido) throw { status: 401, message: 'Contraseña incorrecta' };

  const token = jwt.sign(
    { id: usuario.id, username: usuario.username, rol: usuario.rol },
    process.env.JWT_SECRET || 'secretkey',
    { expiresIn: '1d' }
  );

  return { usuario, token };
}

/**
 * Listar todos los usuarios (solo admin)
 */
export async function listarUsuariosService() {
  const usuarios = await Usuario.findAll({
    attributes: ['id', 'nombre', 'email', 'username', 'rol', 'creado_en']
  });
  return { success: true, usuarios };
}

/**
 * Obtener perfil de usuario por ID
 */
export async function perfilUsuarioService(userId) {
  const usuario = await Usuario.findByPk(userId, {
    attributes: ['id', 'nombre', 'email', 'username', 'rol', 'creado_en']
  });

  if (!usuario) throw { status: 404, message: 'Usuario no encontrado' };
  return { success: true, usuario };
}

/**
 * Actualizar perfil de usuario
 */
export async function actualizarUsuarioService(userId, { nombre, email, password, rol }) {
  const usuario = await Usuario.findByPk(userId);
  if (!usuario) throw { status: 404, message: 'Usuario no encontrado' };

  if (nombre) usuario.nombre = nombre;
  if (email) usuario.email = email;
  if (password) usuario.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  if (rol) usuario.rol = rol;

  await usuario.save();

  return { success: true, usuario };
}


export async function eliminarUsuarioService(id) {
  const usuario = await Usuario.findByPk(id);

  if (!usuario) {
    throw { status: 404, message: 'Usuario no encontrado' };
  }

  await usuario.destroy();

  return { success: true, message: 'Usuario eliminado correctamente' };
}
