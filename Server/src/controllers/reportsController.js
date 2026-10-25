const { Report, Post, User } = require("../DB_config");

const createReport = async ({ reporterUserId, targetUserId, targetPostId, reason }) => {
  const cleanReason = typeof reason === "string" ? reason.trim() : "";
  const targetCount = Number(Boolean(targetUserId)) + Number(Boolean(targetPostId));
  if (targetCount !== 1 || cleanReason.length < 3 || cleanReason.length > 1000) {
    throw new Error("Indica un único objetivo y una explicación de entre 3 y 1000 caracteres.");
  }

  if (targetUserId) {
    if (Number(targetUserId) === Number(reporterUserId)) {
      throw new Error("No puedes denunciarte a ti mismo.");
    }
    if (!(await User.findByPk(targetUserId))) throw new Error("El usuario denunciado no existe.");
  }

  if (targetPostId && !(await Post.findByPk(targetPostId))) {
    throw new Error("La publicación denunciada no existe o ya no está disponible.");
  }

  try {
    return await Report.create({ reporterUserId, targetUserId, targetPostId, reason: cleanReason });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      throw new Error("Ya enviaste una denuncia sobre este contenido.");
    }
    throw error;
  }
};

const listReports = () =>
  Report.findAll({
    include: [
      { model: User, as: "reporter", attributes: ["id", "username", "email"] },
      { model: User, as: "reportedUser", attributes: ["id", "username"] },
      { model: Post, as: "reportedPost", attributes: ["id", "title", "UserId"] },
    ],
    order: [["createdAt", "DESC"]],
  });

const updateReport = async (id, { status, resolutionNote }, resolvedByUserId) => {
  if (!['open', 'reviewing', 'resolved', 'dismissed'].includes(status)) {
    throw new Error("Estado de denuncia inválido.");
  }
  const report = await Report.findByPk(id);
  if (!report) throw new Error("Denuncia no encontrada.");
  await report.update({
    status,
    resolutionNote: typeof resolutionNote === "string" ? resolutionNote.trim().slice(0, 1000) || null : null,
    resolvedByUserId: ["resolved", "dismissed"].includes(status) ? resolvedByUserId : null,
  });
  return report;
};

module.exports = { createReport, listReports, updateReport };
