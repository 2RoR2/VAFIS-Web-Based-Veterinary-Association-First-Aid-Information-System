import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

dotenv.config();

const connection = await mysql.createConnection({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'vafis',
});

const addColumnIfMissing = async (table: string, column: string, definition: string) => {
  const [rows] = await connection.query<mysql.RowDataPacket[]>(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column],
  );
  if (rows.length === 0) {
    await connection.execute(`ALTER TABLE \`${table}\` ADD COLUMN ${definition}`);
    console.log(`  + ${table}.${column}`);
  } else {
    console.log(`  ✓ ${table}.${column} already exists`);
  }
};

try {
  await addColumnIfMissing(
    'guides', 'status',
    `status ENUM('draft','pending_review','reviewed','published','revision_required','archived') NOT NULL DEFAULT 'draft' AFTER id`,
  );
  await addColumnIfMissing('guides', 'createdBy',      'createdBy     VARCHAR(64)  NULL');
  await addColumnIfMissing('guides', 'assignedVetId',  'assignedVetId VARCHAR(64)  NULL');
  await addColumnIfMissing('guides', 'reviewComments', 'reviewComments TEXT         NULL');
  await addColumnIfMissing('guides', 'submittedAt',    'submittedAt   TIMESTAMP    NULL');
  await addColumnIfMissing('guides', 'reviewedAt',     'reviewedAt    TIMESTAMP    NULL');
  await addColumnIfMissing('guides', 'publishedAt',    'publishedAt   TIMESTAMP    NULL');
  await addColumnIfMissing('guides', 'updatedAt',      'updatedAt     TIMESTAMP    NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP');

  // Quiz results table (new table — use CREATE TABLE IF NOT EXISTS)
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS quiz_results (
      id           VARCHAR(64) PRIMARY KEY,
      quizId       VARCHAR(64)  NOT NULL,
      userId       VARCHAR(64)  NOT NULL,
      score        INT          NOT NULL,
      totalQuestions INT        NOT NULL,
      percentage   INT          NOT NULL,
      passed       TINYINT(1)   NOT NULL DEFAULT 0,
      attemptDate  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('  ✓ quiz_results table');

  // Video player fields
  await addColumnIfMissing('videos', 'videoUrl',       'videoUrl       VARCHAR(500) NULL');
  await addColumnIfMissing('videos', 'relatedGuideId', 'relatedGuideId VARCHAR(100) NULL');

  // Mark existing seeded guides as published
  const [result] = await connection.execute<mysql.ResultSetHeader>(
    `UPDATE guides SET status = 'published', publishedAt = NOW() WHERE status = 'draft'`,
  );
  if (result.affectedRows > 0) {
    console.log(`  Marked ${result.affectedRows} existing guide(s) as published.`);
  }

  console.log('Migration complete.');
} catch (error) {
  console.error('Migration failed.', error);
  process.exitCode = 1;
} finally {
  await connection.end();
}



// new endpoints
// GET  /api/guides                 → published guides only (public)
// GET  /api/guides/admin           → all guides, all statuses (admin or vet, cookie required)
// GET  /api/guides/:id             → published for public; any status for admin/vet

// POST /api/guides                 → create guide (draft) — admin
// PUT  /api/guides/:id             → update guide — admin (only draft/revision_required)
// DELETE /api/guides/:id           → delete — admin

// POST /api/guides/:id/submit      → draft → pending_review — admin
//                                    body: { assignedVetId?: "..." }
// POST /api/guides/:id/review      → pending_review → reviewed or revision_required — vet
//                                    body: { action: "approve"|"request_changes", comments?: "..." }
// POST /api/guides/:id/publish     → reviewed → published — admin
// POST /api/guides/:id/unpublish   → published → draft — admin