/**
 * PixelSearch Mobile — Database Utility (Segment 9)
 * Manages local SQLite database for storing image embeddings on-device.
 * All data stays 100% offline on the phone — no server needed.
 */

import * as SQLite from 'expo-sqlite';

let db = null;

export async function getDB() {
  if (!db) {
    db = await SQLite.openDatabaseAsync('pixelsearch.db');
    await initSchema();
  }
  return db;
}

async function initSchema() {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS images (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      uri        TEXT NOT NULL UNIQUE,
      filename   TEXT NOT NULL,
      indexed_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS embeddings (
      image_id  INTEGER PRIMARY KEY REFERENCES images(id) ON DELETE CASCADE,
      vector    BLOB NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tags (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      image_id  INTEGER NOT NULL REFERENCES images(id) ON DELETE CASCADE,
      tag       TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_images_uri ON images(uri);
    CREATE INDEX IF NOT EXISTS idx_tags_image_id ON tags(image_id);
  `);
}

/** Save an image + its embedding (Float32Array → BLOB) */
export async function saveEmbedding(uri, filename, vector, tags = []) {
  const db = await getDB();
  
  // Upsert image record
  await db.runAsync(
    `INSERT OR REPLACE INTO images (uri, filename, indexed_at) VALUES (?, ?, ?)`,
    [uri, filename, Date.now()]
  );

  const row = await db.getFirstAsync(`SELECT id FROM images WHERE uri = ?`, [uri]);
  const imageId = row.id;

  // Store embedding as raw BLOB
  const buffer = Buffer.from(vector.buffer);
  await db.runAsync(
    `INSERT OR REPLACE INTO embeddings (image_id, vector) VALUES (?, ?)`,
    [imageId, buffer]
  );

  // Store tags
  await db.runAsync(`DELETE FROM tags WHERE image_id = ?`, [imageId]);
  for (const tag of tags) {
    await db.runAsync(
      `INSERT INTO tags (image_id, tag) VALUES (?, ?)`,
      [imageId, tag]
    );
  }

  return imageId;
}

/** Retrieve all images with their embeddings for search */
export async function getAllEmbeddings() {
  const db = await getDB();
  const rows = await db.getAllAsync(`
    SELECT i.id, i.uri, i.filename,
           e.vector,
           GROUP_CONCAT(t.tag, ',') as tags
    FROM images i
    JOIN embeddings e ON e.image_id = i.id
    LEFT JOIN tags t ON t.image_id = i.id
    GROUP BY i.id
  `);

  return rows.map(row => ({
    id: row.id,
    uri: row.uri,
    filename: row.filename,
    tags: row.tags ? row.tags.split(',') : [],
    // Convert BLOB back to Float32Array
    vector: new Float32Array(row.vector.buffer || row.vector),
  }));
}

/** Get total count of indexed images */
export async function getIndexedCount() {
  const db = await getDB();
  const row = await db.getFirstAsync(`SELECT COUNT(*) as count FROM images`);
  return row?.count ?? 0;
}

/** Check if a URI is already indexed */
export async function isIndexed(uri) {
  const db = await getDB();
  const row = await db.getFirstAsync(
    `SELECT id FROM images WHERE uri = ?`, [uri]
  );
  return !!row;
}

/** Delete all indexed data */
export async function clearIndex() {
  const db = await getDB();
  await db.execAsync(`DELETE FROM tags; DELETE FROM embeddings; DELETE FROM images;`);
}
