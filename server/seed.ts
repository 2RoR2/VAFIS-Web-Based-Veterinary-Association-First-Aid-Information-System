import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { guides } from '../app/data/guides';
import { videos } from '../app/data/videos';
import { quizzes } from '../app/data/quizzes';
import { clinics, emergencyContacts } from '../app/data/clinics';
import { feedbackItems } from '../app/data/feedback';
import { auditLogs, notifications } from '../app/data/workflow';

dotenv.config();

const toJson = (value: unknown) => JSON.stringify(value);

const connection = await mysql.createConnection({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'vafis',
});

try {
  await connection.beginTransaction();

  await connection.execute('DELETE FROM feedback');
  await connection.execute('DELETE FROM emergency_contacts');
  await connection.execute('DELETE FROM clinics');
  await connection.execute('DELETE FROM quizzes');
  await connection.execute('DELETE FROM videos');
  await connection.execute('DELETE FROM guides');
  await connection.execute('DELETE FROM notifications');
  await connection.execute('DELETE FROM audit_logs');

  for (const guide of guides) {
    await connection.execute(
      `INSERT INTO guides (id, title, species, severity, readTime, description, category, lastReviewed, reviewedBy, steps, warnings, relatedVideos, relatedGuides)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        guide.id,
        guide.title,
        toJson(guide.species),
        guide.severity,
        guide.readTime,
        guide.description,
        guide.category,
        guide.lastReviewed,
        guide.reviewedBy,
        toJson(guide.steps),
        toJson(guide.warnings),
        toJson(guide.relatedVideos),
        toJson(guide.relatedGuides),
      ],
    );
  }

  for (const video of videos) {
    await connection.execute(
      `INSERT INTO videos (id, title, duration, species, category, description, thumbnail, instructor, difficulty, views, videoUrl, relatedGuideId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        video.id,
        video.title,
        video.duration,
        video.species,
        video.category,
        video.description,
        video.thumbnail,
        video.instructor,
        video.difficulty,
        video.views,
        video.videoUrl ?? null,
        video.relatedGuideId ?? null,
      ],
    );
  }

  for (const quiz of quizzes) {
    await connection.execute(
      `INSERT INTO quizzes (id, title, species, category, difficulty, passingScore, questions, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        quiz.id,
        quiz.title,
        quiz.species,
        quiz.category,
        quiz.difficulty,
        quiz.passingScore,
        toJson(quiz.questions),
        quiz.description,
      ],
    );
  }

  for (const clinic of clinics) {
    await connection.execute(
      `INSERT INTO clinics (id, name, address, city, phone, email, website, hours, hoursDetail, distance, isOpen, isEmergency, services, species, rating, reviews, lat, lng)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        clinic.id,
        clinic.name,
        clinic.address,
        clinic.city,
        clinic.phone,
        clinic.email,
        clinic.website ?? null,
        clinic.hours,
        toJson(clinic.hoursDetail),
        clinic.distance,
        clinic.isOpen ? 1 : 0,
        clinic.isEmergency ? 1 : 0,
        toJson(clinic.services),
        toJson(clinic.species),
        clinic.rating,
        clinic.reviews,
        clinic.lat ?? null,
        clinic.lng ?? null,
      ],
    );
  }

  for (const contact of emergencyContacts) {
    await connection.execute(
      `INSERT INTO emergency_contacts (name, phone, description, available)
       VALUES (?, ?, ?, ?)`,
      [contact.name, contact.phone, contact.description, contact.available],
    );
  }

  for (const item of feedbackItems) {
    await connection.execute(
      `INSERT INTO feedback (id, contentType, contentTitle, rating, comment, submittedBy, status, submittedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.contentType,
        item.contentTitle,
        item.rating,
        item.comment,
        item.submittedBy,
        item.status,
        item.submittedAt,
      ],
    );
  }

  for (const notification of notifications) {
    await connection.execute(
      `INSERT INTO notifications (id, audience, event, status, timestamp)
       VALUES (?, ?, ?, ?, ?)`,
      [notification.id, notification.audience, notification.event, notification.status, notification.timestamp],
    );
  }

  for (const log of auditLogs) {
    await connection.execute(
      `INSERT INTO audit_logs (id, actor, action, target, timestamp)
       VALUES (?, ?, ?, ?, ?)`,
      [log.id, log.actor, log.action, log.target, log.timestamp],
    );
  }

  await connection.commit();
  console.log('Database seed complete.');
} catch (error) {
  await connection.rollback();
  console.error('Database seed failed.', error);
  process.exitCode = 1;
} finally {
  await connection.end();
}
