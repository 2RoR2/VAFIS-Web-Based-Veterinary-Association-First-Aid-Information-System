const toRad = (deg) => (deg * Math.PI) / 180;

const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 100) / 100;
};

export class ClinicDirectory {
  constructor(pool) {
    this.pool = pool;
  }

  async findAll({ conditions = [], params = [] } = {}) {
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await this.pool.query(`SELECT * FROM clinics ${where}`, params);
    return rows;
  }

  async findById(id) {
    const [rows] = await this.pool.query('SELECT * FROM clinics WHERE id = ?', [id]);
    return rows[0] ?? null;
  }

  async create({ id, name, address, city, phone, email, website, hours, isEmergency, services, species, lat, lng }) {
    await this.pool.execute(
      `INSERT INTO clinics
         (id, name, address, city, phone, email, website, hours, hoursDetail,
          distance, isOpen, isEmergency, services, species, rating, reviews, lat, lng)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, '{}', '', 0, ?, ?, ?, 0, 0, ?, ?)`,
      [id, name, address, city, phone, email, website, hours, isEmergency, services, species, lat, lng],
    );
    return this.findById(id);
  }

  async update(id, { name, address, city, phone, email, website, hours, isEmergency, services, species, lat, lng }) {
    await this.pool.execute(
      `UPDATE clinics SET
         name = ?, address = ?, city = ?, phone = ?, email = ?, website = ?,
         hours = ?, isEmergency = ?, services = ?, species = ?, lat = ?, lng = ?
       WHERE id = ?`,
      [name, address, city, phone, email, website, hours, isEmergency, services, species, lat, lng, id],
    );
    return this.findById(id);
  }

  async delete(id) {
    await this.pool.execute('DELETE FROM clinics WHERE id = ?', [id]);
  }

  async findEmergencyContacts() {
    const [rows] = await this.pool.query('SELECT * FROM emergency_contacts');
    return rows;
  }

  async findNearby({ lat, lng, conditions = [], params = [] }) {
    const allConditions = ['lat IS NOT NULL', 'lng IS NOT NULL', ...conditions];
    const where = `WHERE ${allConditions.join(' AND ')}`;
    const [rows] = await this.pool.query(`SELECT * FROM clinics ${where}`, params);
    return rows
      .map((row) => ({ ...row, distanceKm: haversineKm(lat, lng, row.lat, row.lng) }))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }
}
