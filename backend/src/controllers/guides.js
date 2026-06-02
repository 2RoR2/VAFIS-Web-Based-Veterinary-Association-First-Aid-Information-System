import crypto from 'node:crypto';
import { GuideRepository } from '../repositories/GuideRepository.js';

// Safely parses a JSON value that may arrive as a Buffer, string, or already-parsed object.
// Returns the fallback if the value is null or undefined.
const parseJson = (value, fallback) => {
  if (value === null || value === undefined) return fallback;
  if (Buffer.isBuffer(value)) return JSON.parse(value.toString('utf8')) ?? fallback;
  if (typeof value === 'string') return JSON.parse(value) ?? fallback;
  return value ?? fallback;
};

// Maps a database guide row to the public-facing guide object, parsing all JSON columns.
const mapGuide = (row) => ({
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

// ── Search strategies (Strategy pattern) ────────────────────────────────────

// Search strategy: matches the keyword against guide title and description (case-insensitive).
const keywordStrategy = (q) => ({
  sql: '(LOWER(title) LIKE ? OR LOWER(description) LIKE ?)',
  params: [`%${q.toLowerCase()}%`, `%${q.toLowerCase()}%`],
});

// Search strategy: matches guides whose species JSON array contains the given species value.
const speciesStrategy = (species) => ({
  // species column is a JSON array e.g. ["Dogs","Cats"] — match the quoted element
  sql: 'species LIKE ?',
  params: [`%"${species}"%`],
});

// Search strategy: matches guides with an exact category value.
const categoryStrategy = (category) => ({
  sql: 'category = ?',
  params: [category],
});

// Search strategy: matches guides with an exact severity level.
const severityStrategy = (severity) => ({
  sql: 'severity = ?',
  params: [severity],
});

// Searches published guides using one or more strategy-based filter conditions built from query params.
export const searchGuides = (pool) => async (req, res) => {
  const repo = new GuideRepository(pool);
  const { q, species, category, severity } = req.query;

  const strategies = [];
  if (q?.trim())        strategies.push(keywordStrategy(q.trim()));
  if (species?.trim())  strategies.push(speciesStrategy(species.trim()));
  if (category?.trim()) strategies.push(categoryStrategy(category.trim()));
  if (severity?.trim()) strategies.push(severityStrategy(severity.trim()));

  const conditions = ["status = 'published'", ...strategies.map((s) => s.sql)];
  const params     = strategies.flatMap((s) => s.params);

  const rows = await repo.search({ conditions, params });
  res.json(rows.map(mapGuide));
};

// ── Public ──────────────────────────────────────────────────────────────────

// Returns all published guides, visible to the public.
export const getPublishedGuides = (pool) => async (_req, res) => {
  const repo = new GuideRepository(pool);
  const rows = await repo.findPublished();
  res.json(rows.map(mapGuide));
};

// Returns all guides regardless of status, intended for admin and vet pipeline views.
export const getAdminGuides = (pool) => async (_req, res) => {
  const repo = new GuideRepository(pool);
  const rows = await repo.findAll();
  res.json(rows.map(mapGuide));
};

// Returns a single guide by ID. Non-published guides are hidden from non-admin/vet users.
export const getGuideById = (pool) => async (req, res) => {
  const repo = new GuideRepository(pool);
  const guide = await repo.findById(req.params.id);

  if (!guide) {
    res.status(404).json({ error: 'Guide not found.' });
    return;
  }

  const role = req.user?.role;
  if (guide.status !== 'published' && role !== 'admin' && role !== 'professional') {
    res.status(404).json({ error: 'Guide not found.' });
    return;
  }

  res.json(mapGuide(guide));
};

// ── Admin CRUD ───────────────────────────────────────────────────────────────

// Creates a new first-aid guide in draft status and logs the creation in the audit trail.
export const createGuide = (pool) => async (req, res) => {
  const repo = new GuideRepository(pool);
  const { title, species, severity, readTime, description, category, steps, warnings, relatedVideos, relatedGuides } = req.body ?? {};

  if (!title || !species || !severity || !readTime || !description || !category || !steps) {
    res.status(400).json({ error: 'Missing required fields: title, species, severity, readTime, description, category, steps.' });
    return;
  }

  const id = `guide-${crypto.randomUUID().slice(0, 8)}`;

  const created = await repo.create({
    id,
    title,
    species:       JSON.stringify(Array.isArray(species) ? species : [species]),
    severity,
    readTime,
    description,
    category,
    steps:         JSON.stringify(steps),
    warnings:      JSON.stringify(warnings ?? []),
    relatedVideos: JSON.stringify(relatedVideos ?? []),
    relatedGuides: JSON.stringify(relatedGuides ?? []),
    createdBy:     req.user.id,
  });

  await repo.logAudit(req.user.email, 'GUIDE_CREATED', title);

  res.status(201).json(mapGuide(created));
};

// Updates an existing guide's fields. Only allowed when the guide is in draft or revision_required status.
export const updateGuide = (pool) => async (req, res) => {
  const repo = new GuideRepository(pool);
  const guide = await repo.findById(req.params.id);

  if (!guide) {
    res.status(404).json({ error: 'Guide not found.' });
    return;
  }

  if (!['draft', 'revision_required'].includes(guide.status)) {
    res.status(409).json({ error: `Guide cannot be edited while in '${guide.status}' status.` });
    return;
  }

  const { title, species, severity, readTime, description, category, steps, warnings, relatedVideos, relatedGuides } = req.body ?? {};

  const updated = await repo.update(req.params.id, {
    title:         title ?? null,
    species:       species ? JSON.stringify(Array.isArray(species) ? species : [species]) : null,
    severity:      severity ?? null,
    readTime:      readTime ?? null,
    description:   description ?? null,
    category:      category ?? null,
    steps:         steps ? JSON.stringify(steps) : null,
    warnings:      warnings ? JSON.stringify(warnings) : null,
    relatedVideos: relatedVideos ? JSON.stringify(relatedVideos) : null,
    relatedGuides: relatedGuides ? JSON.stringify(relatedGuides) : null,
  });

  await repo.logAudit(req.user.email, 'GUIDE_UPDATED', guide.title);

  res.json(mapGuide(updated));
};

// Permanently deletes a guide and logs the deletion in the audit trail. Responds 404 if not found.
export const deleteGuide = (pool) => async (req, res) => {
  const repo = new GuideRepository(pool);
  const guide = await repo.findById(req.params.id);

  if (!guide) {
    res.status(404).json({ error: 'Guide not found.' });
    return;
  }

  await repo.delete(req.params.id);
  await repo.logAudit(req.user.email, 'GUIDE_DELETED', guide.title);

  res.json({ message: 'Guide deleted.' });
};

// ── Workflow transitions ─────────────────────────────────────────────────────

// Transitions a guide to pending_review and notifies the assigned vet (or all vets if none assigned).
export const submitForReview = (pool) => async (req, res) => {
  const repo = new GuideRepository(pool);
  const guide = await repo.findById(req.params.id);

  if (!guide) {
    res.status(404).json({ error: 'Guide not found.' });
    return;
  }

  if (!['draft', 'revision_required'].includes(guide.status)) {
    res.status(409).json({ error: `Guide cannot be submitted for review from '${guide.status}' status.` });
    return;
  }

  const { assignedVetId } = req.body ?? {};

  const updated = await repo.submitForReview(req.params.id, assignedVetId);

  let audience = 'Veterinary Professional';
  if (assignedVetId) {
    const vet = await repo.findUserByIdForNotification(assignedVetId);
    if (vet) audience = vet.email;
  }

  await repo.logAudit(req.user.email, 'GUIDE_SUBMITTED_FOR_REVIEW', guide.title);
  await repo.notify(audience, `Guide "${guide.title}" is pending your clinical review.`);

  res.json(mapGuide(updated));
};

// Processes a vet's review decision: approve moves the guide to reviewed, request_changes moves it to revision_required.
export const reviewGuide = (pool) => async (req, res) => {
  const repo = new GuideRepository(pool);
  const guide = await repo.findById(req.params.id);

  if (!guide) {
    res.status(404).json({ error: 'Guide not found.' });
    return;
  }

  if (guide.status !== 'pending_review') {
    res.status(409).json({ error: 'Guide is not pending review.' });
    return;
  }

  const { action, comments } = req.body ?? {};

  if (!['approve', 'request_changes'].includes(action)) {
    res.status(400).json({ error: 'action must be "approve" or "request_changes".' });
    return;
  }

  if (action === 'request_changes' && !comments?.trim()) {
    res.status(400).json({ error: 'comments are required when requesting changes.' });
    return;
  }

  const reviewDate = new Date().toISOString().slice(0, 10);
  let updated;

  if (action === 'approve') {
    updated = await repo.approve(req.params.id, reviewDate, req.user.fullName ?? req.user.email);
    await repo.notify('Administrator', `Guide "${guide.title}" passed clinical review and is ready to publish.`);
    await repo.logAudit(req.user.email, 'GUIDE_REVIEW_APPROVED', guide.title);
  } else {
    updated = await repo.requestChanges(req.params.id, comments.trim());
    await repo.notify('Administrator', `Guide "${guide.title}" requires revisions: ${comments.trim()}`);
    await repo.logAudit(req.user.email, 'GUIDE_REVIEW_CHANGES_REQUESTED', guide.title);
  }

  res.json(mapGuide(updated));
};

// Publishes a reviewed guide, making it publicly visible to all users.
export const publishGuide = (pool) => async (req, res) => {
  const repo = new GuideRepository(pool);
  const guide = await repo.findById(req.params.id);

  if (!guide) {
    res.status(404).json({ error: 'Guide not found.' });
    return;
  }

  if (guide.status !== 'reviewed') {
    res.status(409).json({ error: `Guide must be in 'reviewed' status to publish. Current: '${guide.status}'.` });
    return;
  }

  const updated = await repo.publish(req.params.id);
  await repo.logAudit(req.user.email, 'GUIDE_PUBLISHED', guide.title);

  res.json(mapGuide(updated));
};

// Archives a guide, removing it from public view while retaining it for audit purposes.
export const archiveGuide = (pool) => async (req, res) => {
  const repo = new GuideRepository(pool);
  const guide = await repo.findById(req.params.id);

  if (!guide) {
    res.status(404).json({ error: 'Guide not found.' });
    return;
  }

  if (guide.status === 'archived') {
    res.status(409).json({ error: 'Guide is already archived.' });
    return;
  }

  if (guide.status === 'pending_review') {
    res.status(409).json({ error: 'Cannot archive a guide that is pending review.' });
    return;
  }

  const updated = await repo.archive(req.params.id);
  await repo.logAudit(req.user.email, 'GUIDE_ARCHIVED', guide.title);

  res.json(mapGuide(updated));
};

// Reverts a published guide back to draft status, removing it from public view.
export const unpublishGuide = (pool) => async (req, res) => {
  const repo = new GuideRepository(pool);
  const guide = await repo.findById(req.params.id);

  if (!guide) {
    res.status(404).json({ error: 'Guide not found.' });
    return;
  }

  if (guide.status !== 'published') {
    res.status(409).json({ error: 'Only published guides can be unpublished.' });
    return;
  }

  const updated = await repo.unpublish(req.params.id);
  await repo.logAudit(req.user.email, 'GUIDE_UNPUBLISHED', guide.title);

  res.json(mapGuide(updated));
};
