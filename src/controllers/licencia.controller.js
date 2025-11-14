import Licencia from '../models/licencia.js'
import crypto from 'crypto'
 
//  ACTIVAR LICENCIA (desde cliente Electron)
export const activarLicencia = async (req, res) => {
  const { licenseKey, machineId } = req.body
  if (!licenseKey || !machineId) {
    return res.status(400).json({ success: false, message: "Faltan datos" })
  }

  try {
    const licencia = await Licencia.findOne({ where: { licencia_key: licenseKey } })
    if (!licencia) {
      return res.status(404).json({ success: false, message: "Licencia no encontrada" })
    }

    if (licencia.estado !== 'activa') {
      return res.status(403).json({ success: false, message: "Licencia suspendida o expirada" })
    }

    if (licencia.machine_id && licencia.machine_id !== machineId) {
      return res.status(403).json({ success: false, message: "Licencia ya activada en otro equipo" })
    }

    licencia.machine_id = machineId
    licencia.activada_en = new Date()
    await licencia.save()

    // 🔥 Importante: incluir tipo y expira_en
    const data = `${licenseKey}|${machineId}|${licencia.activada_en}`
    const token = crypto.createHmac('sha256', process.env.SECRET_KEY).update(data).digest('hex')

    return res.json({
      success: true,
      message: "Licencia activada",
      token,
      tipo: licencia.tipo,
      expira_en: licencia.expira_en
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: "Error interno" })
  }
}


//  GESTIONAR desde admin (crear)
export const crearLicencia = async (req, res) => {
  const { licencia_key, cliente_nombre, tipo, dias } = req.body;
  if (!licencia_key) {
    return res.status(400).json({ success: false, message: "Falta clave" });
  }

  try {
    const existente = await Licencia.findOne({ where: { licencia_key } });
    if (existente) {
      return res.status(409).json({ success: false, message: "La clave de licencia ya existe" });
    }

    let nuevaLicencia;
    if (tipo === 'trial') {
      if (!dias || dias <= 0) {
        return res.status(400).json({ success: false, message: "Debes indicar los días de prueba" });
      }
      const ahora = new Date();
      const expira_en = new Date(ahora.getTime() + (dias * 24 * 60 * 60 * 1000));
      nuevaLicencia = await Licencia.create({
        licencia_key,
        cliente_nombre,
        tipo: 'trial',
        estado: 'activa',
        activada_en: ahora,
        expira_en
      });
    } else {
      nuevaLicencia = await Licencia.create({
        licencia_key,
        cliente_nombre,
        tipo: 'normal',
        estado: 'activa'
      });
    }

    return res.json({ success: true, licencia: nuevaLicencia });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Error al crear licencia" });
  }
};



//  GESTIONAR desde admin (listar)
export const listarLicencias = async (req, res) => {
  try {
    const licencias = await Licencia.findAll();

    // map para agregar días_restantes
    const licenciasConDias = licencias.map(l => {
      let dias_restantes = "-";
      if (l.tipo === "trial" && l.expira_en) {
        const hoy = new Date();
        const expira = new Date(l.expira_en);
        const diff = Math.ceil((expira - hoy) / (1000 * 60 * 60 * 24));
        dias_restantes = diff > 0 ? diff : 0;
      }
      return {
        ...l.toJSON(),
        dias_restantes
      };
    });

    return res.json(licenciasConDias);

  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: "Error" })
  }
}


//  GESTIONAR desde admin (liberar)
export const liberarLicencia = async (req, res) => {
  const { id } = req.params
  try {
    const licencia = await Licencia.findByPk(id)
    if (!licencia) {
      return res.status(404).json({ success: false, message: "No encontrada" })
    }
    licencia.machine_id = null
    await licencia.save()
    return res.json({ success: true, message: "Licencia liberada" })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ success: false, message: "Error" })
  }
}

//  Actualizar cliente_nombre o estado
export const actualizarLicencia = async (req, res) => {
  const { id } = req.params;
  const { cliente_nombre, estado } = req.body;

  try {
    const licencia = await Licencia.findByPk(id);
    if (!licencia) {
      return res.status(404).json({ success: false, message: "Licencia no encontrada" });
    }

    if (cliente_nombre !== undefined) licencia.cliente_nombre = cliente_nombre;
    if (estado !== undefined) licencia.estado = estado;
    await licencia.save();

    return res.json({ success: true, message: "Licencia actualizada", licencia });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Error interno" });
  }
};






