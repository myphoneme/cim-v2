"""
Migration script to add new columns to attachments table.
Run this once: python migrate.py
"""
import sqlite3

DB_PATH = "./database.sqlite"

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Check if columns already exist
    cursor.execute("PRAGMA table_info(attachments)")
    columns = [col[1] for col in cursor.fetchall()]

    if "document_category" not in columns:
        print("Adding document_category column...")
        cursor.execute("""
            ALTER TABLE attachments
            ADD COLUMN document_category VARCHAR DEFAULT 'implementation'
        """)
        print("✓ document_category column added")
    else:
        print("✓ document_category column already exists")

    if "is_published" not in columns:
        print("Adding is_published column...")
        cursor.execute("""
            ALTER TABLE attachments
            ADD COLUMN is_published BOOLEAN DEFAULT 1
        """)
        print("✓ is_published column added")
    else:
        print("✓ is_published column already exists")

    conn.commit()
    conn.close()
    print("\nMigration complete!")

if __name__ == "__main__":
    migrate()
