// This file runs in the MAIN process
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

let db = null;
let sqlite = null;

const VIDEO_QUALITY = [
  { id: 1, name: "Highest" },
  { id: 2, name: "1080" },
  { id: 3, name: "720" },
  { id: 4, name: "Lowest" },
];

const LANGUAGES = [
  { id: 1, name: "en_US" },
  { id: 2, name: "Hindi" },
  { id: 3, name: "Tamil" },
  { id: 4, name: "Spanish" },
  { id: 5, name: "German" },
  { id: 6, name: "Chinese" },
  { id: 7, name: "French" },
];

/**
 * Initialize SQLite database in main process
 */
function initDatabase(userDataPath) {
  if (db) {
    return true;
  }

  const dbPath = path.join(userDataPath, "udelerpro.db");

  // Ensure directory exists
  if (!fs.existsSync(userDataPath)) {
    fs.mkdirSync(userDataPath, { recursive: true });
  }

  // Create database connection
  sqlite = new Database(dbPath);

  // Enable foreign keys
  sqlite.pragma("foreign_keys = ON");

  // Create tables
  createTables();

  // Initialize default settings
  initializeDefaultSettings();

  db = true;
  return true;
}

/**
 * Create database tables
 */
function createTables() {
  // Auth table
  sqlite
    .prepare(
      `
    CREATE TABLE IF NOT EXISTS auth (
      id TEXT PRIMARY KEY,
      token TEXT NOT NULL
    )
  `
    )
    .run();

  // Settings table
  sqlite
    .prepare(
      `
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      videoQuality TEXT NOT NULL,
      language TEXT NOT NULL,
      downloadPath TEXT
    )
  `
    )
    .run();

  // Courses table
  sqlite
    .prepare(
      `
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      courseName TEXT,
      lectureId TEXT,
      status TEXT
    )
  `
    )
    .run();
}

/**
 * Initialize default settings
 */
function initializeDefaultSettings() {
  const existingSettings = sqlite
    .prepare("SELECT * FROM settings WHERE id = ?")
    .get("1");

  if (!existingSettings) {
    const stmt = sqlite.prepare(
      "INSERT INTO settings (id, videoQuality, language, downloadPath) VALUES (?, ?, ?, ?)"
    );
    stmt.run(
      "1",
      JSON.stringify(VIDEO_QUALITY[2]),
      JSON.stringify(LANGUAGES[0]),
      ""
    );
  }
}

// Auth operations
function authInsert(data) {
  const stmt = sqlite.prepare(
    "INSERT OR REPLACE INTO auth (id, token) VALUES (?, ?)"
  );
  stmt.run(data.id, data.token);
  return data;
}

function authFindOne(id) {
  const row = sqlite.prepare("SELECT * FROM auth WHERE id = ?").get(id);
  return row;
}

function authRemove(id) {
  const stmt = sqlite.prepare("DELETE FROM auth WHERE id = ?");
  stmt.run(id);
  return true;
}

// Settings operations
function settingsFindOne(id) {
  const row = sqlite.prepare("SELECT * FROM settings WHERE id = ?").get(id);
  if (!row) return null;

  // Parse JSON fields
  return {
    id: row.id,
    videoQuality: JSON.parse(row.videoQuality),
    language: JSON.parse(row.language),
    downloadPath: row.downloadPath,
  };
}

function settingsUpdate(data) {
  const stmt = sqlite.prepare(
    "UPDATE settings SET videoQuality = ?, language = ?, downloadPath = ? WHERE id = ?"
  );
  stmt.run(
    JSON.stringify(data.videoQuality),
    JSON.stringify(data.language),
    data.downloadPath || "",
    data.id
  );
  return data;
}

// Courses operations
function coursesInsert(data) {
  const stmt = sqlite.prepare(
    "INSERT OR REPLACE INTO courses (id, courseName, lectureId, status) VALUES (?, ?, ?, ?)"
  );
  stmt.run(data.id, data.courseName, data.lectureId, data.status);
  return data;
}

function coursesFindOne(id) {
  const row = sqlite.prepare("SELECT * FROM courses WHERE id = ?").get(id);
  return row;
}

function coursesFind() {
  const rows = sqlite.prepare("SELECT * FROM courses").all();
  return rows;
}

function coursesUpdate(id, data) {
  const stmt = sqlite.prepare(
    "UPDATE courses SET courseName = ?, lectureId = ?, status = ? WHERE id = ?"
  );
  stmt.run(data.courseName, data.lectureId, data.status, id);
  return true;
}

function coursesRemove(id) {
  const stmt = sqlite.prepare("DELETE FROM courses WHERE id = ?");
  stmt.run(id);
  return true;
}

module.exports = {
  initDatabase,
  authInsert,
  authFindOne,
  authRemove,
  settingsFindOne,
  settingsUpdate,
  coursesInsert,
  coursesFindOne,
  coursesFind,
  coursesUpdate,
  coursesRemove,
};
