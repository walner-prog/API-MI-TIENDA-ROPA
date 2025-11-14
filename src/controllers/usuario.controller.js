import * as usuarioService from '../service/usuario.service.js';

export const registrarUsuario = async (req, res) => {
  try {
    const usuario = await usuarioService.registerUsuarioService(req.body);
    res.json({ success: true, usuario });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error interno'
    });
  }
}

export async function loginUsuario(req, res) {
  try {
    const { usuario, token } = await usuarioService.loginUsuarioService(req.body);
    res.json({ success: true, usuario, token });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' });
  }
}

export const listarUsuarios = async (req, res) => {
  try {
    const data = await usuarioService.listarUsuariosService();
    res.json(data);
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error interno'
    });
  }
};




/**
 * PUT /api/usuarios/:id
 * Actualiza datos del usuario
 */
export async function actualizarUsuario(req, res) {
  try {
    const { id } = req.params;
    const { nombre, email, password, rol } = req.body;

    const data = await usuarioService.actualizarUsuarioService(id, { nombre, email, password, rol });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ success: false, message: err.message || 'Error al actualizar usuario' });
  }
}


/**
 * GET /api/usuarios/perfil
 * Devuelve la información del usuario autenticado
 */
export async function perfilUsuario(req, res) {
  try {
   const id = req.usuario.id;
 // Se obtiene desde el middleware auth
    const data = await usuarioService.perfilUsuarioService(id);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ success: false, message: err.message || 'Error al obtener perfil' });
  }
}

export async function eliminarUsuario(req, res) {
  try {
    const { id } = req.params; // viene desde la URL
    const data = await usuarioService.eliminarUsuarioService(id);

    res.json(data);
  } catch (err) {
    console.error(err);
    return res
      .status(err.status || 500)
      .json({ success: false, message: err.message || "Error al eliminar usuario" });
  }
}