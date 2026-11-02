const { test } = require("node:test");
const assert = require("node:assert/strict");
const { Sequelize } = require("sequelize");
const { randomUUID } = require("node:crypto");
const { createVerificationCode } = require("../src/utils/verificationCode");
const { verificationCodeStore } = require("../src/utils/verificationCodeStore");

test("Postgres migration and row locks enforce one send and one successful confirmation", { skip: !process.env.TEST_DATABASE_URL }, async () => {
  // Only point TEST_DATABASE_URL at an isolated test branch, never production.
  const db = new Sequelize(process.env.TEST_DATABASE_URL, { logging: false, dialectOptions: { ssl: { require: true, rejectUnauthorized: true } } });
  try {
    require("../src/models/User")(db);
    require("../src/models/EmailVerificationCode")(db);
    const User = db.models.User;
    const EmailVerificationCode = db.models.EmailVerificationCode;
    await EmailVerificationCode.sync();
    await EmailVerificationCode.sync(); // Startup must be idempotent.
    const name = `otp-test-${randomUUID()}`;
    const user = await User.create({ username: name, email: `${name}@example.com`, password: "test-only", ubication: "Test", origin: "local" });
    let sent = 0, verified = 0;
    const service = createVerificationCode({ secret: "isolated-test-secret", generateCode: () => "012345", withLock: verificationCodeStore({ sequelize: db, User, EmailVerificationCode }), sendMail: async () => { sent++; }, markVerified: async () => { verified++; } });
    const sends = await Promise.allSettled([service.send(user), service.send(user)]);
    assert.equal(sends.filter((r) => r.status === "fulfilled").length, 1);
    assert.equal(sent, 1);
    await assert.rejects(service.verify(user, "000000"));
    assert.equal((await EmailVerificationCode.findByPk(user.id)).attempts, 1);
    const confirmations = await Promise.allSettled([service.verify(user, "012345"), service.verify(user, "012345")]);
    assert.equal(confirmations.filter((r) => r.status === "fulfilled").length, 1);
    assert.equal(verified, 1);
  } finally { await db.close(); }
});
