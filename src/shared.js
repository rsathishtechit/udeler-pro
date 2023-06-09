const { createRxDatabase, addRxPlugin, isRxCollection } = require("rxdb");
const { RxDBQueryBuilderPlugin } = require("rxdb/plugins/query-builder");
const { RxDBDevModePlugin } = require("rxdb/plugins/dev-mode");

addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBDevModePlugin);

const settingsSchema = {
  title: "Settings Schema",
  description: "Default Settings",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    videoQuality: {
      type: "string",
    },
    language: {
      type: "string",
    },
  },
  required: ["id", "videoQuality", "language"],
};

const courseSchema = {
  title: "Course Schema",
  description: "Course Download Status",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    courseName: {
      type: "string",
    },
    lectureId: {
      type: "string",
    },
    status: {
      type: "string",
    },
  },
  required: ["id"],
};

async function getDatabase(name, storage) {
  const db = await createRxDatabase({
    name,
    storage,
    ignoreDuplicate: true,
  });

  console.log("creating hero-collection..");
  await db.addCollections({
    settings: {
      schema: settingsSchema,
    },
    courses: {
      schema: courseSchema,
    },
  });

  // db.settings.remove();
  // db.settings.destroy();

  const id = await db.settings
    .findOne({
      selector: {
        id: {
          $eq: "1",
        },
      },
    })
    .exec();

  if (id === null && id?._data.id !== "1") {
    const obj = {
      id: "1",
      videoQuality: "720",
      language: "English",
    };
    await db.settings.insert(obj);
  }

  return db;
}

module.exports = {
  getDatabase,
};
