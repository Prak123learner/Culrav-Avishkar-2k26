function validateProductionConfig(env = process.env) {
  if (env.NODE_ENV !== "production") return;
  const origins = (env.FRONTEND_URL || "").split(",").map((value) => value.trim());
  if (!origins.length || origins.some((value) => !value))
    throw new Error("Set FRONTEND_URL to one or more public HTTPS website origins");

  const uniqueOrigins = new Set();
  for (const value of origins) {
    let origin;
    try {
      origin = new URL(value);
    } catch {
      throw new Error("FRONTEND_URL must contain exact HTTPS origins");
    }
    if (
      origin.protocol !== "https:" ||
      origin.origin !== value ||
      origin.username ||
      origin.password ||
      uniqueOrigins.has(value)
    )
      throw new Error("FRONTEND_URL must contain exact, unique HTTPS origins");
    uniqueOrigins.add(value);
  }
  if (!env.JWT_SECRET || env.JWT_SECRET.length < 32)
    throw new Error("Set a JWT_SECRET of at least 32 characters");
}

module.exports = { validateProductionConfig };
