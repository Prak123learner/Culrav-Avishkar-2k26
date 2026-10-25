const catalog = require("./registration-catalog.json");
const { Category, Subevent } = require("./models");
async function seedCatalog() {
  let count = 0;
  for (const item of catalog) {
    const category = await Category.findOneAndUpdate(
      { festival: item.festival, slug: item.slug },
      {
        $set: {
          name: item.name || item.slug,
        },
        $setOnInsert: {
          festival: item.festival,
          slug: item.slug,
        },
      },
      { upsert: true, new: true },
    );
    for (const data of item.events) {
      const min = data.minTeamSize;
      const max = data.maxTeamSize;
      await Subevent.updateOne(
        { fixedKey: data.fixedKey },
        {
          $set: {
            title: data.title,
            mode: max === 1 ? "solo" : min === 1 ? "solo_or_team" : "team",
            minTeamSize: min,
            maxTeamSize: max,
          },
          $setOnInsert: {
            fixedKey: data.fixedKey,
            categoryId: category.id,
            configurationRequired: false,
            formPublished: false,
            status: "published",
            allowEdits: true,
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
