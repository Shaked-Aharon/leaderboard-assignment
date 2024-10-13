import pool from './db.config';

const createTables = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS Users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        imageUrl VARCHAR(255) NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS Scores (
        userId INT REFERENCES Users(id) ON DELETE CASCADE,
        score INT DEFAULT 0,
        PRIMARY KEY(userId)
      );
    `);

    console.log('Tables created successfully!');
  } catch (err) {
    console.error('Error creating tables', err);
  } finally {
    client.release();
  }
};

export default createTables;
