// Deterministic extraction only: never eval JSX or execute client modules.
const fs = require("node:fs");
const path = require("node:path");
const { parse } = require("../client/node_modules/@babel/parser");
function literal(node) {
  if (["StringLiteral", "NumericLiteral", "BooleanLiteral"].includes(node.type))
    return node.value;
  if (node.type === "NullLiteral") return null;
  if (node.type === "TemplateLiteral" && node.expressions.length === 0)
    return node.quasis.map((q) => q.value.cooked).join("");
  if (node.type === "ArrayExpression") return node.elements.map(literal);
  if (node.type === "ObjectExpression")
    return Object.fromEntries(
      node.properties.map((p) => [p.key.name || p.key.value, literal(p.value)]),
    );
  throw new Error(`Nonliteral catalog value: ${node.type}`);
}
const catalog = [];
for (const festival of ["avishkar", "culrav"]) {
  const dir = path.join(__dirname, "../client/src/pages", festival);
  for (const filename of fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".jsx"))
    .sort()) {
    const ast = parse(fs.readFileSync(path.join(dir, filename), "utf8"), {
      sourceType: "module",
      plugins: ["jsx"],
    });
    const declaration = ast.program.body
      .flatMap((n) => (n.type === "VariableDeclaration" ? n.declarations : []))
      .find(
        (n) =>
          n.init?.type === "ObjectExpression" &&
          n.init.properties.some((p) => p.key?.name === "events"),
      );
    if (!declaration) throw new Error(`No event data found: ${filename}`);
    const data = literal(declaration.init);
    catalog.push({
      festival,
      slug: path.basename(filename, ".jsx").toLowerCase(),
      name: data.eventName || data.name || path.basename(filename, ".jsx"),
      source: `client/src/pages/${festival}/${filename}`,
      data,
    });
  }
}
process.stdout.write(JSON.stringify(catalog, null, 2) + "\n");
