import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET;


const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ success: false, message: 'No autorizado' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'No autorizado' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token inválido' });
  }
};

export default authMiddleware;

export const esAdmin = (req, res, next) => {
  if (req.usuario?.rol !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acceso denegado, solo admins' });
  }
  next();
};
