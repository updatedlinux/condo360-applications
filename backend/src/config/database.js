const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de la base de datos
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wordpress',
  charset: 'utf8mb4',
  timezone: '-04:00', // GMT-4
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: false, // Devolver fechas como objetos Date
  supportBigNumbers: true,
  bigNumberStrings: true
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Configurar timezone de la sesión MySQL a GMT-4 al obtener conexión
const configureConnection = async (connection) => {
  try {
    await connection.query(`SET time_zone = '-04:00'`);
    console.log('✅ Timezone de MySQL configurado a GMT-4');
  } catch (error) {
    console.error('Error configurando timezone de MySQL:', error);
  }
};

// Función para autenticar la conexión
const authenticate = async () => {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error('Error de conexión a la base de datos:', error);
    throw error;
  }
};

// Función para ejecutar consultas
const query = async (sql, params = []) => {
  let connection;
  try {
    connection = await pool.getConnection();
    // Configurar timezone si no está configurado
    await connection.query(`SET time_zone = '-04:00'`);
    const [rows] = await connection.execute(sql, params);
    return rows;
  } catch (error) {
    console.error('Error en consulta SQL:', error);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// Función para obtener una conexión del pool
const getConnection = async () => {
  try {
    const connection = await pool.getConnection();
    // Configurar timezone de la conexión
    await configureConnection(connection);
    return connection;
  } catch (error) {
    console.error('Error al obtener conexión:', error);
    throw error;
  }
};

// Función para cerrar el pool de conexiones
const close = async () => {
  try {
    await pool.end();
    console.log('Pool de conexiones cerrado correctamente');
  } catch (error) {
    console.error('Error al cerrar pool de conexiones:', error);
    throw error;
  }
};

module.exports = {
  pool,
  authenticate,
  query,
  getConnection,
  close
};
