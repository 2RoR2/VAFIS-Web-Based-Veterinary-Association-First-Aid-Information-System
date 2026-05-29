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
    const sql = `
      SELECT *,
        ROUND(
          6371 * ACOS(
            COS(RADIANS(?)) * COS(RADIANS(lat)) * COS(RADIANS(lng) - RADIANS(?)) +
            SIN(RADIANS(?)) * SIN(RADIANS(lat))
          ),
          2
        ) AS distanceKm
      FROM clinics
      WHERE ${allConditions.join(' AND ')}
      ORDER BY distanceKm ASC
    `;
    // Haversine needs lat, lng, lat before any additional filter params
    const [rows] = await this.pool.query(sql, [lat, lng, lat, ...params]);
    return rows;
  }
}
