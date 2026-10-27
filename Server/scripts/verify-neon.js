// Run against a locally started API: node scripts/verify-neon.js http://127.0.0.1:3101
const assert = require("node:assert/strict");
const { randomUUID } = require("node:crypto");
const { conn, User, Post } = require("../src/DB_config");
const jwt = require("jsonwebtoken");

const base = process.argv[2] || "http://127.0.0.1:3101";
assert.ok(["localhost", "127.0.0.1"].includes(new URL(base).hostname), "Use a local API");
assert.match(new URL(process.env.DATABASE_URL).hostname, /\.neon\.tech$/, "Expected Neon database");
const marker = `neon-check-${randomUUID()}`;
let user;
let token;

async function request(path, method = "GET", body, expected = 200) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { token } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(30000),
  });
  assert.equal(response.status, expected, `${method} ${path}: unexpected HTTP status`);
  console.log(`PASS ${method} ${path}: HTTP ${response.status}`);
  return response.json();
}

async function main() {
  try {
    await conn.authenticate();
    // With PgBouncer, pg_stat_ssl describes the pooler's internal connection.
    // Inspect the actual client socket to verify transport and certificate.
    const connection = await conn.connectionManager.getConnection();
    try {
      assert.equal(connection.connection.stream.encrypted, true);
      assert.equal(connection.connection.stream.authorized, true);
    } finally {
      await conn.connectionManager.releaseConnection(connection);
    }
    console.log("PASS Neon PostgreSQL connection with TLS");
    await request("/health");
    assert.equal((await request("/ready")).status, "ready");
    assert.ok(Array.isArray(await request("/posts")));
    user = await User.create({
      username: marker, email: `${marker}@example.invalid`,
      password: randomUUID(), ubication: "Test",
    });
    token = jwt.sign({ user: user.id }, process.env.JWTSECRET, { expiresIn: "5m" });
    const post = await request("/posts", "POST", {
      title: marker, description: "Database connection verification",
      category: "Test", ubication: "Test", image: [],
    }, 201);
    assert.equal((await Post.findByPk(post.id)).UserId, user.id);
    assert.equal((await request(`/posts/${post.id}`)).title, marker);
    await request(`/posts/${post.id}`, "PUT", { title: `${marker}-updated` });
    assert.equal((await Post.findByPk(post.id)).title, `${marker}-updated`);
    await request(`/posts/deletePost/${post.id}`, "DELETE");
    assert.equal(await Post.findByPk(post.id, { paranoid: false }), null);
    console.log("PASS HTTP create/read/update/delete persisted in Neon");
  } finally {
    if (user) {
      await Post.destroy({ where: { UserId: user.id }, force: true });
      await user.destroy({ force: true });
      console.log("PASS temporary verification records removed");
    }
    await conn.close();
  }
}

main().catch((error) => {
  console.error(`FAIL ${error.name}: ${error.message}`);
  process.exitCode = 1;
});
