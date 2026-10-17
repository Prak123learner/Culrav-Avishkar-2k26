function validateProductionConfig(env = process.env) {
  if (env.NODE_ENV !== "production") return;
  let origin;
  try {
    origin = new URL(env.FRONTEND_URL);
  } catch {
    throw new Error("Set FRONTEND_URL to the public HTTPS website origin");
  }
  if (
    origin.protocol !== "https:" ||
    origin.origin !== env.FRONTEND_URL ||
    origin.username ||
    origin.password
  )
    throw new Error("FRONTEND_URL must be one exact HTTPS origin");
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32)
    throw new Error("Set a JWT_SECRET of at least 32 characters");
}

module.exports = { validateProductionConfig };
