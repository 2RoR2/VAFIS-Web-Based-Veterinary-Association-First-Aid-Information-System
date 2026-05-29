import crypto from 'node:crypto';

const mapVideo = (row) => ({
  id: row.id,
  title: row.title,
  duration: row.duration,
  species: row.species,
  category: row.category,
  description: row.description,
  thumbnail: row.thumbnail,
  instructor: row.instructor,
  difficulty: row.difficulty,
  views: Number(row.views ?? 0),
  videoUrl: row.videoUrl ?? null,
  relatedGuideId: row.relatedGuideId ?? null,
});

export const getVideos = (pool) => async (_req, res) => {
  const [rows] = await pool.query('SELECT * FROM videos ORDER BY title ASC');
  res.json(rows.map(mapVideo));
};

export const getVideoById = (pool) => async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM videos WHERE id = ?', [req.params.id]);
  if (!rows[0]) { res.status(404).json({ error: 'Video not found.' }); return; }
  res.json(mapVideo(rows[0]));
};

export const createVideo = (pool) => async (req, res) => {
  const { title, duration, species, category, description, thumbnail, instructor, difficulty, videoUrl, relatedGuideId } = req.body ?? {};

  if (!title?.trim() || !species?.trim() || !category?.trim() || !duration?.trim()) {
    res.status(400).json({ error: 'Missing required fields: title, species, category, duration.' });
    return;
  }

  const id = `video-${crypto.randomUUID().slice(0, 8)}`;

  await pool.execute(
    `INSERT INTO videos (id, title, duration, species, category, description, thumbnail, instructor, difficulty, views, videoUrl, relatedGuideId)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
    [
      id, title.trim(), duration.trim(), species.trim(), category.trim(),
      description ?? '', thumbnail ?? '', instructor ?? '',
      difficulty ?? 'Beginner', videoUrl || null, relatedGuideId || null,
    ],
  );

  const [created] = await pool.query('SELECT * FROM videos WHERE id = ?', [id]);
  res.status(201).json(mapVideo(created[0]));
};

export const updateVideo = (pool) => async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM videos WHERE id = ?', [req.params.id]);
  const existing = rows[0];
  if (!existing) { res.status(404).json({ error: 'Video not found.' }); return; }

  const { title, duration, species, category, description, thumbnail, instructor, difficulty, videoUrl, relatedGuideId } = req.body ?? {};

  await pool.execute(
    `UPDATE videos SET
       title = ?, duration = ?, species = ?, category = ?,
       description = ?, thumbnail = ?, instructor = ?, difficulty = ?,
       videoUrl = ?, relatedGuideId = ?
     WHERE id = ?`,
    [
      title ?? existing.title,
      duration ?? existing.duration,
      species ?? existing.species,
      category ?? existing.category,
      description !== undefined ? description : existing.description,
      thumbnail !== undefined ? thumbnail : existing.thumbnail,
      instructor !== undefined ? instructor : existing.instructor,
      difficulty ?? existing.difficulty,
      videoUrl !== undefined ? (videoUrl || null) : existing.videoUrl,
      relatedGuideId !== undefined ? (relatedGuideId || null) : existing.relatedGuideId,
      req.params.id,
    ],
  );

  const [updated] = await pool.query('SELECT * FROM videos WHERE id = ?', [req.params.id]);
  res.json(mapVideo(updated[0]));
};

export const deleteVideo = (pool) => async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM videos WHERE id = ?', [req.params.id]);
  if (!rows[0]) { res.status(404).json({ error: 'Video not found.' }); return; }
  await pool.execute('DELETE FROM videos WHERE id = ?', [req.params.id]);
  res.json({ message: 'Video deleted.' });
};
