require("dotenv").config();


const ENV = process.env.NODE_ENV || "development";

module.exports = {
  env: ENV,
  isDev: ENV === "development",
  isProd: ENV === "production",

  port: process.env.PORT || 3001,

  db: {
    deploy: process.env.DATABASE_URL,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
  },

  frontendUrl: process.env.FRONTEND_URL,
};