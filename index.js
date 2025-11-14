// server.js
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import sequelize from './src/config/database.js'

// RUTAS
import usuarioRoutes from './src/routes/usuario.routes.js'
import productoRoutes from './src/routes/producto.routes.js'
import ventaRoutes from './src/routes/venta.routes.js'
import gastoRoutes from './src/routes/gasto.routes.js'
import clienteRoutes from './src/routes/cliente.routes.js'
import  reporteRoutes  from './src/routes/reporte.routes.js'

dotenv.config()

const app = express()

// Middlewares globales
app.use(cors())          // Permite acceso desde tu app móvil / web
app.use(express.json())  // Body JSON

// ==== RUTAS PRINCIPALES ====
app.use('/api/usuarios', usuarioRoutes)
app.use('/api/productos', productoRoutes)
app.use('/api/ventas', ventaRoutes)
app.use('/api/gastos', gastoRoutes)
app.use('/api/clientes', clienteRoutes)
app.use('/api/reportes', reporteRoutes)

 

// ==== MANEJO DE ERRORES GLOBAL ====
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err)
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Error interno del servidor'
  })
})

// Puerto
const PORT = process.env.PORT || 3000

// ==== INICIALIZAR SERVIDOR ====
async function startServer() {
  try {
    console.log('⏳ Conectando a la base de datos...')

    await sequelize.authenticate()
    console.log('✅ Conexión a MySQL establecida')

    // En desarrollo puedes usar alter:true
    await sequelize.sync({ alter: true })
    console.log('🔄 Tablas sincronizadas con MySQL')

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo correctamente en http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error)
    process.exit(1)
  }
}

startServer()
