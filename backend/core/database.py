"""
PixelSearch -- SQLite Database Module (Segment 3)
Manages image metadata (paths, filenames, FAISS IDs, detection tags) persistently.
"""

import sqlite3
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from config import DB_PATH

class Database:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        self._init_db()

    def _get_connection(self):
        # sqlite3 needs check_same_thread=False if using FastAPI later
        return sqlite3.connect(self.db_path, check_same_thread=False)

    def _init_db(self):
        """Initialize the database schema."""
        os.makedirs(os.path.dirname(self.db_path), exist_ok=True)
        with self._get_connection() as conn:
            cursor = conn.cursor()
            
            # Images Table
            # faiss_id maps directly to the row index in the FAISS Index
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS images (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    faiss_id INTEGER UNIQUE,
                    filename TEXT NOT NULL,
                    filepath TEXT UNIQUE NOT NULL,
                    date_indexed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # For Segment 4 (we will use this later for YOLO tags)
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS object_tags (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    image_id INTEGER,
                    tag TEXT NOT NULL,
                    confidence REAL,
                    FOREIGN KEY(image_id) REFERENCES images(id)
                )
            ''')
            
            conn.commit()

    def add_image(self, faiss_id: int, filename: str, filepath: str) -> int:
        """Add an image to the database. Returns the DB ID."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            try:
                cursor.execute(
                    'INSERT INTO images (faiss_id, filename, filepath) VALUES (?, ?, ?)',
                    (faiss_id, filename, filepath)
                )
                conn.commit()
                return cursor.lastrowid
            except sqlite3.IntegrityError:
                # If filepath or faiss_id already exists, ignore or handle
                return -1

    def get_image_by_faiss_id(self, faiss_id: int) -> dict:
        """Fetch image metadata by its FAISS row index."""
        with self._get_connection() as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM images WHERE faiss_id = ?', (faiss_id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    def add_tags(self, image_id: int, tags: list):
        """Add YOLO tags for a specific image ID to the database."""
        if not tags: return
        with self._get_connection() as conn:
            cursor = conn.cursor()
            for tag_data in tags:
                cursor.execute(
                    'INSERT INTO object_tags (image_id, tag, confidence) VALUES (?, ?, ?)',
                    (image_id, tag_data['tag'], tag_data['confidence'])
                )
            conn.commit()

    def get_tags_for_image(self, image_id: int) -> list:
        """Fetch all tags associated with an image ID."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT tag, confidence FROM object_tags WHERE image_id = ?', (image_id,))
            return [{"tag": row[0], "confidence": row[1]} for row in cursor.fetchall()]

    def get_all_indexed_paths(self) -> set:
        """Returns a set of all file paths currently in the database to avoid re-indexing."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT filepath FROM images')
            return {row[0] for row in cursor.fetchall()}

    def clear(self):
        """Drops tables (used for full re-indexing)."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('DROP TABLE IF EXISTS object_tags')
            cursor.execute('DROP TABLE IF EXISTS images')
            conn.commit()
        self._init_db()
