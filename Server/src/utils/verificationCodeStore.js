function verificationCodeStore({ sequelize, User, EmailVerificationCode }) {
  return (user, operation) => sequelize.transaction(async (transaction) => {
    // Lock the user even before their first code row exists, so concurrent
    // requests cannot reset attempt counts or send multiple valid codes.
    const current = await User.findByPk(user.id, { transaction, lock: transaction.LOCK.UPDATE });
    if (!current || current.email !== user.email) throw new Error("La cuenta ya no está disponible.");
    const row = await EmailVerificationCode.findByPk(user.id, { transaction });
    return operation(row?.get({ plain: true }), (values) => EmailVerificationCode.upsert({ ...values, userId: user.id }, { transaction }));
  });
}
module.exports = { verificationCodeStore };
