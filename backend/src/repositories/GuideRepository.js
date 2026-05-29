const parseJson = (value, fallback) => {
  if (value === null || value === undefined) return fallback;
  if (Buffer.isBuffer(value)) return JSON.parse(value.toString('utf8')) ?? fallback;
  if (typeof value === 'string') return JSON.parse(value) ?? fallback;
  return value ?? fallback;
};

export const mapGuide = (row) => ({
  id: row.id,
  status: row.status ?? 'published',
  title: row.title,
  species: parseJson(row.species, []),
  severity: row.severity,
  readTime: row.readTime,
  description: row.description,
  category: row.category,
  lastReviewed: row.lastReviewed,
  reviewedBy: row.reviewedBy,
  steps: parseJson(row.steps, []),
  warnings: parseJson(row.warnings, []),
  relatedVideos: parseJson(row.relatedVideos, []),
  relatedGuides: parseJson(row.relatedGuides, []),
  createdBy: row.createdBy ?? null,
  assignedVetId: row.assignedVetId ?? null,
  reviewComments: row.reviewComments ?? null,
  submittedAt: row.submittedAt ?? null,
  reviewedAt: row.reviewedAt ?? null,
  publishedAt: row.publishedAt ?? null,
  updatedAt: row.updatedAt ?? null,
});

export class GuideRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async findById(id) {
    const [rows] = await this.pool.query('SELECT * FROM guides WHERE id = ?', [id]);
    return rows[0] ? mapGuide(rows[0]) : null;
  }

  async findPendingReviews(vetId) {
    const params = vetId ? [vetId] : [];
    const assignmentFilter = vetId ? 'AND (assignedVetId IS NULL OR assignedVetId = ?)' : '';
    const [rows] = await this.pool.query(
      `SELECT * FROM guides
       WHERE status = 'pending_review' ${assignmentFilter}
       ORDER BY submittedAt ASC, updatedAt ASC, id ASC`,
      params,
    );

    return rows.map(mapGuide);
  }

  async markApproved(id, reviewerName) {
    const reviewDate = new Date().toISOString().slice(0, 10);

    await this.pool.execute(
      `UPDATE guides
       SET status = 'reviewed',
           reviewedAt = NOW(),
           lastReviewed = ?,
           reviewedBy = ?,
           reviewComments = NULL
       WHERE id = ?`,
      [reviewDate, reviewerName, id],
    );

    return this.findById(id);
  }

  async markRevisionRequired(id, comments) {
    await this.pool.execute(
      `UPDATE guides
       SET status = 'revision_required',
           reviewComments = ?,
           reviewedAt = NOW()
       WHERE id = ?`,
      [comments, id],
    );

    return this.findById(id);
  }
}
