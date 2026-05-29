import { randomUUID } from 'node:crypto';

export class GuideRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async findPublished() {
    const [rows] = await this.pool.query('SELECT * FROM guides WHERE status = ?', ['published']);
    return rows;
  }

  async findAll() {
    const [rows] = await this.pool.query('SELECT * FROM guides ORDER BY updatedAt DESC, id ASC');
    return rows;
  }

  async findById(id) {
    const [rows] = await this.pool.query('SELECT * FROM guides WHERE id = ?', [id]);
    return rows[0] ?? null;
  }

  async search({ conditions, params }) {
    const sql = `SELECT * FROM guides WHERE ${conditions.join(' AND ')} ORDER BY publishedAt DESC`;
    const [rows] = await this.pool.query(sql, params);
    return rows;
  }

  async create({ id, title, species, severity, readTime, description, category, steps, warnings, relatedVideos, relatedGuides, createdBy }) {
    await this.pool.execute(
      `INSERT INTO guides
         (id, status, title, species, severity, readTime, description, category,
          lastReviewed, reviewedBy, steps, warnings, relatedVideos, relatedGuides, createdBy)
       VALUES (?, 'draft', ?, ?, ?, ?, ?, ?, '', '', ?, ?, ?, ?, ?)`,
      [id, title, species, severity, readTime, description, category, steps, warnings, relatedVideos, relatedGuides, createdBy],
    );
    return this.findById(id);
  }

  async update(id, { title, species, severity, readTime, description, category, steps, warnings, relatedVideos, relatedGuides }) {
    await this.pool.execute(
      `UPDATE guides SET
         title         = COALESCE(?, title),
         species       = COALESCE(?, species),
         severity      = COALESCE(?, severity),
         readTime      = COALESCE(?, readTime),
         description   = COALESCE(?, description),
         category      = COALESCE(?, category),
         steps         = COALESCE(?, steps),
         warnings      = COALESCE(?, warnings),
         relatedVideos = COALESCE(?, relatedVideos),
         relatedGuides = COALESCE(?, relatedGuides)
       WHERE id = ?`,
      [title, species, severity, readTime, description, category, steps, warnings, relatedVideos, relatedGuides, id],
    );
    return this.findById(id);
  }

  async delete(id) {
    await this.pool.execute('DELETE FROM guides WHERE id = ?', [id]);
  }

  async submitForReview(id, assignedVetId) {
    await this.pool.execute(
      `UPDATE guides SET status = 'pending_review', assignedVetId = ?, submittedAt = NOW(), reviewComments = NULL WHERE id = ?`,
      [assignedVetId ?? null, id],
    );
    return this.findById(id);
  }

  async approve(id, reviewDate, reviewerName) {
    await this.pool.execute(
      `UPDATE guides SET status = 'reviewed', reviewedAt = NOW(), lastReviewed = ?, reviewedBy = ?, reviewComments = NULL WHERE id = ?`,
      [reviewDate, reviewerName, id],
    );
    return this.findById(id);
  }

  async requestChanges(id, comments) {
    await this.pool.execute(
      `UPDATE guides SET status = 'revision_required', reviewComments = ?, reviewedAt = NOW() WHERE id = ?`,
      [comments, id],
    );
    return this.findById(id);
  }

  async publish(id) {
    await this.pool.execute(
      `UPDATE guides SET status = 'published', publishedAt = NOW() WHERE id = ?`,
      [id],
    );
    return this.findById(id);
  }

  async archive(id) {
    await this.pool.execute(`UPDATE guides SET status = 'archived' WHERE id = ?`, [id]);
    return this.findById(id);
  }

  async unpublish(id) {
    await this.pool.execute(`UPDATE guides SET status = 'draft' WHERE id = ?`, [id]);
    return this.findById(id);
  }

  async findUserByIdForNotification(userId) {
    const [rows] = await this.pool.query('SELECT email FROM users WHERE id = ?', [userId]);
    return rows[0] ?? null;
  }

  async logAudit(actor, action, target) {
    await this.pool.execute(
      'INSERT INTO audit_logs (id, actor, action, target, timestamp) VALUES (?, ?, ?, ?, ?)',
      [randomUUID(), actor, action, target, new Date().toISOString()],
    );
  }

  async notify(audience, event) {
    await this.pool.execute(
      'INSERT INTO notifications (id, audience, event, status, timestamp) VALUES (?, ?, ?, ?, ?)',
      [randomUUID(), audience, event, 'unread', new Date().toISOString()],
    );
  }
}
