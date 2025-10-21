// This file runs in the RENDERER process
// It provides an RxDB-like interface but uses IPC to communicate with the main process

import { ipcRenderer } from "electron";

/**
 * Get database instance (renderer-side wrapper)
 */
function getDatabase() {
  // Return database object with collection-like interface
  return {
    auth: {
      insert: async (data) => {
        const response = ipcRenderer.sendSync("db-auth-insert", data);
        if (!response.success) throw new Error(response.error);
        return response.data;
      },

      findOne: (query) => {
        return {
          exec: async () => {
            const id = query.selector?.id?.$eq || "1";
            const response = ipcRenderer.sendSync("db-auth-find-one", id);
            if (!response.success) throw new Error(response.error);
            if (!response.data) return null;
            return {
              _data: response.data,
            };
          },
        };
      },

      find: (query) => {
        const id = query.selector?.id?.$eq || "1";
        return {
          remove: async () => {
            const response = ipcRenderer.sendSync("db-auth-remove", id);
            if (!response.success) throw new Error(response.error);
            return response.data;
          },
        };
      },
    },

    settings: {
      insert: async (data) => {
        const response = ipcRenderer.sendSync("db-settings-update", data);
        if (!response.success) throw new Error(response.error);
        return response.data;
      },

      findOne: (query) => {
        return {
          exec: async () => {
            const id = query.selector?.id?.$eq || "1";
            const response = ipcRenderer.sendSync("db-settings-find-one", id);
            if (!response.success) throw new Error(response.error);
            if (!response.data) return null;

            return {
              _data: response.data,
              update: async (newData) => {
                const updateResponse = ipcRenderer.sendSync(
                  "db-settings-update",
                  newData
                );
                if (!updateResponse.success)
                  throw new Error(updateResponse.error);
                return {
                  _data: updateResponse.data,
                };
              },
            };
          },
        };
      },
    },

    courses: {
      insert: async (data) => {
        const response = ipcRenderer.sendSync("db-courses-insert", data);
        if (!response.success) throw new Error(response.error);
        return response.data;
      },

      findOne: (query) => {
        return {
          exec: async () => {
            const id = query.selector?.id?.$eq;
            if (!id) return null;
            const response = ipcRenderer.sendSync("db-courses-find-one", id);
            if (!response.success) throw new Error(response.error);
            if (!response.data) return null;
            return {
              _data: response.data,
            };
          },
        };
      },

      find: (query) => {
        return {
          exec: async () => {
            const response = ipcRenderer.sendSync("db-courses-find");
            if (!response.success) throw new Error(response.error);
            return response.data.map((row) => ({ _data: row }));
          },
        };
      },

      update: async (query, data) => {
        const id = query.selector?.id?.$eq;
        if (!id) return false;
        const response = ipcRenderer.sendSync("db-courses-update", id, data);
        if (!response.success) throw new Error(response.error);
        return response.data;
      },

      remove: async (query) => {
        const id = query.selector?.id?.$eq;
        if (!id) return false;
        const response = ipcRenderer.sendSync("db-courses-remove", id);
        if (!response.success) throw new Error(response.error);
        return response.data;
      },
    },
  };
}

export { getDatabase };
