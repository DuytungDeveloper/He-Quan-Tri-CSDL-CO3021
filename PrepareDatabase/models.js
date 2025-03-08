export const optimizeProductTable = async (db) => {
  const listIndexName = [
    { name: "name_index", unique: true },
    { name: "category_index", unique: false },
    { name: "description_index", unique: false },
    { name: "price_index", unique: false },
    { name: "stock_index", unique: false },
    { name: "search_name_category_description_index", unique: false },
  ];

  const prod = await db.collection("products");
//   await prod.dropIndexes();

  for (let i = 0; i < listIndexName.length; i++) {
    console.log("🚀 ~ optimizeProductTable ~ i:", i);
    const indexInfo = listIndexName[i];
    const name = indexInfo.name;
    if (await prod.indexExists(name)) continue;
    const splitName = name.split("_");
    if (splitName.length === 2) {
      try {
        await prod.createIndex(
          {
            [splitName[0]]: 1,
          },
          { name, unique: indexInfo.unique }
        );
      } catch (error) {
        console.log("🚀 ~ optimizeProductTable ~ error:", error);
      }
    } else {
      switch (name) {
        case "search_name_category_description_index":
          await prod.createIndex(
            {
              name: "text",
              description: "text",
              category: "text",
            },
            { name, unique: indexInfo.unique }
          );
          break;

        default:
          break;
      }
    }
  }
};
