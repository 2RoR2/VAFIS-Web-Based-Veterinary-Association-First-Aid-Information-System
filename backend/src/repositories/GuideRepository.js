import { randomUUID } from 'node:crypto';

/**
 * Data-access layer for first-aid guides.
 * All database interactions for the guides table are routed through this class, keeping query logic out of controller functions.
 */
export class GuideRepository {
  constructor(pool) {
    this.pool = pool;
  }

  // Returns all guides whose status is 'published'.
  async findPublished() {
    const [rows] = await this.pool.query('SELECT * FROM guides WHERE status = ?', ['published']);
    return rows;
  }

  /**
   * Returns every guide regardless of status, ordered newest-updated first.
   * Intended for admin/vet views that need full pipeline visibility.
   */
  async findAll() {
    const [rows] = await this.pool.query('SELECT * FROM guides ORDER BY updatedAt DESC, id ASC');
    return rows;
  }

  // Looks up a single guide by its primary key.
  async findById(id) {
    const [rows] = await this.pool.query('SELECT * FROM guides WHERE id = ?', [id]);
    return rows[0] ?? null;
  }

  /**
   * Runs a dynamic SQL search using pre-built conditions and parameters.
   * Results are ordered by publishedAt descending.
   */
  async search({ conditions, params }) {
    const sql = `SELECT * FROM guides WHERE ${conditions.join(' AND ')} ORDER BY publishedAt DESC`;
    const [rows] = await this.pool.query(sql, params);
    return rows;
  }

  // Inserts a new guide row in 'draft' status.
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

  // Applies a partial update to a guide. Passing null for any field leaves that column unchanged via the COALESCE pattern in the query.
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

  // Permanently removes a guide from the database.
  async delete(id) {
    await this.pool.execute('DELETE FROM guides WHERE id = ?', [id]);
  }

  /**
   * Transitions a guide to 'pending_review' and optionally assigns a specific vet.
   * Also records the submission timestamp.
   */
  async submitForReview(id, assignedVetId) {
    await this.pool.execute(
      `UPDATE guides SET status = 'pending_review', assignedVetId = ?, submittedAt = NOW(), reviewComments = NULL WHERE id = ?`,
      [assignedVetId ?? null, id],
    );
    return this.findById(id);
  }

  // Marks a guide as 'reviewed' (clinically approved by a vet) and records who reviewed it.
  async approve(id, reviewDate, reviewerName) {
    await this.pool.execute(
      `UPDATE guides SET status = 'reviewed', reviewedAt = NOW(), lastReviewed = ?, reviewedBy = ?, reviewComments = NULL WHERE id = ?`,
      [reviewDate, reviewerName, id],
    );
    return this.findById(id);
  }

  // Transitions a guide to 'revision_required' and stores the vet's comments.
  async requestChanges(id, comments) {
    await this.pool.execute(
      `UPDATE guides SET status = 'revision_required', reviewComments = ?, reviewedAt = NOW() WHERE id = ?`,
      [comments, id],
    );
    return this.findById(id);
  }

  // Publishes an approved guide, making it publicly visible to pet owners.
  async publish(id) {
    await this.pool.execute(
      `UPDATE guides SET status = 'published', publishedAt = NOW() WHERE id = ?`,
      [id],
    );
    return this.findById(id);
  }

  // Archives a guide so it is no longer publicly visible but is retained for audit purposes.
  async archive(id) {
    await this.pool.execute(`UPDATE guides SET status = 'archived' WHERE id = ?`, [id]);
    return this.findById(id);
  }

  // Reverts a published guide back to 'draft', removing it from public view.
  async unpublish(id) {
    await this.pool.execute(`UPDATE guides SET status = 'draft' WHERE id = ?`, [id]);
    return this.findById(id);
  }

  // Fetches only the email address of a user, used when building notification recipients.
  async findUserByIdForNotification(userId) {
    const [rows] = await this.pool.query('SELECT email FROM users WHERE id = ?', [userId]);
    return rows[0] ?? null;
  }

  // Appends an immutable entry to the audit_logs table.
  async logAudit(actor, action, target) {
    await this.pool.execute(
      'INSERT INTO audit_logs (id, actor, action, target, timestamp) VALUES (?, ?, ?, ?, ?)',
      [randomUUID(), actor, action, target, new Date().toISOString()],
    );
  }

  // Creates an in-app notification for a given audience.
  async notify(audience, event) {
    await this.pool.execute(
      'INSERT INTO notifications (id, audience, event, status, timestamp) VALUES (?, ?, ?, ?, ?)',
      [randomUUID(), audience, event, 'unread', new Date().toISOString()],
    );
  }
}
