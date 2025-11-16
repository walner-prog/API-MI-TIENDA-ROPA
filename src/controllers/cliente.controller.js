import * as clienteService from '../service/cliente.service.js';

export const crearCliente = async (req, res) => {
  try {
    const result = await clienteService.crearClienteService(req.body);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' });
  }
};

export const listarClientes = async (req, res) => {
  try {
    const result = await clienteService.listarClientesService();
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' });
  }
};

export const obtenerCliente = async (req, res) => {
  try {
    const result = await clienteService.obtenerClienteService(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' });
  }
};

export const eliminarCliente = async (req, res) => {
  try {
    const result = await clienteService.eliminarClienteService(req.params.id);
    res.json(result);
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Error interno' });
  }
};

export async function listarClientesCreditoController(req, res) {
  try {
    const { estado, desde, hasta, page } = req.query;

    const result = await clienteService.listarClientesCreditoService({
      estado,
      desde,
      hasta,
      page: parseInt(page) || 1
    });

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error al listar clientes con crédito'
    });
  }
}

/**
 * 
 * Controlador para listar clientes que tienen deuda pendiente para abonos
 */

export async function listarClientesConDeudaController(req, res) {
    try {
        const clientes = await clienteService.listarClientesConDeudaService();

        return res.json({
            success: true,
            clientes
        });

    } catch (error) {
        console.error("Error al obtener clientes con deuda:", error);
        return res.status(500).json({
            success: false,
            message: "Error al obtener clientes con deuda"
        });
    }
}
   
