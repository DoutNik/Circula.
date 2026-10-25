const httpServer = require("./serverConfig");
const { conn, User } = require("./src/DB_config");

const PORT = process.env.PORT || 3001;

const ensureSchema = async () => {
  await conn.sync({ force: false });

  // El proyecto no ejecutaba migraciones al desplegar. Esta migración mínima e
  // idempotente evita romper instalaciones existentes al añadir FCM; las tablas
  // nuevas de reportes y bloqueos las crea sync si todavía no existen.
  const queryInterface = conn.getQueryInterface();
  const tableName = User.getTableName();
  const columns = await queryInterface.describeTable(tableName);
  if (!columns.fcmToken) {
    await queryInterface.addColumn(tableName, "fcmToken", {
      type: require("sequelize").DataTypes.STRING(512),
      allowNull: true,
    });
  }
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
