import { createRxDatabase, addRxPlugin, isRxCollection } from "rxdb";
import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";

addRxPlugin(RxDBQueryBuilderPlugin);
addRxPlugin(RxDBDevModePlugin);

import { VIDEO_QUALITY, LANGUAGES } from "../constants/settings";

const authSchema = {
  title: "Auth Schema",
  description: "Store Token",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100,
    },
    token: {
      type: "string",
    },
  },
  required: ["id", "token"],
};

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
    downloadPath: {
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

let db = false;

async function getDatabase(name, storage) {
  if (!db) {
    db = await createRxDatabase({
      name,
      storage,
      ignoreDuplicate: true,
      multiInstance: false,
      eventReduce: true,
    });

    await db.addCollections({
      settings: {
        schema: settingsSchema,
      },
      courses: {
        schema: courseSchema,
      },
      auth: {
        schema: authSchema,
      },
    });

    // await db.settings.destroy();
    // await db.courses.destroy();
    // await db.auth.destroy();

    // Checking for the existing records
    if (db.settings) {
      const id = await db.settings
        .findOne({
          selector: {
            id: {
              $eq: "1",
            },
          },
        })
        .exec();

      // Inserting default settings if  settings not exist already
      if (id === null && id?._data.id !== "1") {
        const obj = {
          id: "1",
          videoQuality: VIDEO_QUALITY[2],
          language: LANGUAGES[0],
          downloadPath: "",
        };
        await db.settings.insert(obj);
      }
    }
  }
  return db;
}

export { getDatabase };
