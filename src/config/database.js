import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(
  process.env.MYSQLDATABASE,
  process.env.MYSQLUSER,
  process.env.MYSQLPASSWORD || "",   // 🔥 importante
  {
    host: process.env.MYSQLHOST,
    dialect: "mysql",
    port: process.env.MYSQLPORT,
    timezone: process.env.TIMEZONE,
    logging: false,
  }
);

export default sequelize;
