async function buildUniqueSocialUsername(name, email, isTaken) {
  const preferredName = name || email.split("@")[0] || "usuario";
  const base = preferredName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_.-]/g, "")
    .slice(0, 40) || "usuario";
  let username = base;
  let number = 2;
  while (await isTaken(username)) {
    username = `${base}-${number++}`;
  }
  return username;
}

module.exports = { buildUniqueSocialUsername };
