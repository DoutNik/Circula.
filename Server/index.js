const httpServer = require("./serverConfig");
const { conn, User, createConnection } = require("./src/DB_config");

const PORT = process.env.PORT || 3001;

const ensureSchema = async () => {
  // Neon schema work uses the direct connection; requests keep the pooled URL.
  const schema = process.env.DATABASE_URL_UNPOOLED
    ? createConnection(process.env.DATABASE_URL_UNPOOLED)
    : { conn, User };
  try {
    await schema.conn.sync({ force: false });

    // El proyecto no ejecutaba migraciones al desplegar. Esta migración mínima e
    // idempotente evita romper instalaciones existentes al añadir FCM; las tablas
    // nuevas de reportes y bloqueos las crea sync si todavía no existen.
    const queryInterface = schema.conn.getQueryInterface();
    const tableName = schema.User.getTableName();
    const columns = await queryInterface.describeTable(tableName);
    if (!columns.fcmToken) {
      await queryInterface.addColumn(tableName, "fcmToken", {
        type: require("sequelize").DataTypes.STRING(512),
        allowNull: true,
      });
    }
  } finally {
    if (schema.conn !== conn) await schema.conn.close();
  }
  await conn.authenticate();
};

httpServer.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  ensureSchema()
    .then(() => {
      httpServer.app.set("dbReady", true);
      console.log("Database ready");
    })
    .catch((error) => {
      console.error("Database initialization failed:", error);
      // Render reiniciará el proceso; permanecer vivo serviría un 503 eterno.
      process.exit(1);
    });
});
