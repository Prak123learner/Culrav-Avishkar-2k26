const catalog = require("./catalog.json");
const { Category, Subevent } = require("./models");
// Only explicit participation limits from the original rules are mapped here.
const culturalSizes = {
  anunaad: {
    "Voice of Culrav": [1, 1],
    Harmony: [2, 2],
    Ijaad: [1, 4],
    Rocktave: [3, 8],
    Vadya: [1, 5],
    Euphony: [3, 5],
  },
  darkroom: {
    "Picture Tale": [1, 1],
    Layers: [1, 1],
    "B-Roll": [1, 4],
    "Short-Film": [1, 4],
  },
  litmuse: { "Spell-bee": [1, 2] },
  rangmanch: {
    "Hasyamanch - Comic Play": [8, 15],
    "Pratibimb - Mono Act competition": [1, 1],
    "Naatyamanch - Stage Play": [8, 45],
    "Nukkad - Street Play": [18, 26],
  },
  rangsazzi: {
    "PAINT THE WAY": [4, 5],
    "LET’S FACE IT": [2, 2],
    SWADDLE: [2, 4],
    "BLIND ART": [2, 2],
    "Momento Vinci": [1, 1],
  },
  razzmatazz: {
    "Vault of Dance (Western Group Dance Competition)": [6, 30],
    "Revel (Solo/Duet Dance Competition)": [1, 2],
  },
};
async function seedCatalog() {
  let count = 0;
  for (const item of catalog) {
    const category = await Category.findOneAndUpdate(
      { festival: item.festival, slug: item.slug },
      {
        $setOnInsert: {
          festival: item.festival,
          slug: item.slug,
          name: item.name || item.slug,
        },
      },
      { upsert: true, new: true },
    );
    for (const [index, data] of item.data.events.entries()) {
      const title = data.eventName || data.name;
      const sizes =
        data.minTeamSize != null && data.maxTeamSize != null
          ? [data.minTeamSize, data.maxTeamSize]
          : culturalSizes[item.slug]?.[title];
      const [min, max] = sizes || [1, 1];
      const coordinators = data.coordinators || data.coords || [];
      const description = data.description ?? data.desc ?? "";
      await Subevent.updateOne(
        { fixedKey: `${item.festival}/${item.slug}/${index}` },
        {
          $setOnInsert: {
            fixedKey: `${item.festival}/${item.slug}/${index}`,
            categoryId: category.id,
            title,
            description: Array.isArray(description)
              ? description.join("\n\n")
              : description,
            rules: (data.rules || []).join("\n"),
            contact: coordinators
              .map(
                (c) =>
                  `${c.name}${c.contact || c.phone ? ` — ${c.contact || c.phone}` : ""}`,
              )
              .join("\n"),
            mode: max === 1 ? "solo" : min === 1 ? "solo_or_team" : "team",
            minTeamSize: min,
            maxTeamSize: max,
            configurationRequired: false,
            formPublished: false,
            status: "published",
            allowEdits: true,
            sourceData: data,
            formVersions: [{ version: 1, fields: [] }],
            currentVersion: 1,
          },
        },
        { upsert: true },
      );
      count += 1;
    }
  }
  return { categories: catalog.length, subevents: count };
}
module.exports = { seedCatalog };
