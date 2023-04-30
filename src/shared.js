const { createRxDatabase, addRxPlugin } = require("rxdb");
const { RxDBQueryBuilderPlugin } = require("rxdb/plugins/query-builder");
const { RxDBDevModePlugin } = require("rxdb/plugins/dev-mode");

addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBDevModePlugin);

const authSchema = {
  title: "token",
  description: "describes a auth token",
  version: 0,
  primaryKey: "token",
  type: "object",
  properties: {
    token: {
      type: "string",
      maxLength: 100,
    },
  },
  required: ["token"],
};

async function getDatabase(name, storage) {
  const db = await createRxDatabase({
    name,
    storage,
  });

  console.log("creating auth-collection..");
  await db.addCollections({
    auth: {
      schema: authSchema,
    },
  });

  return db;
}

module.exports = {
  getDatabase,
};
