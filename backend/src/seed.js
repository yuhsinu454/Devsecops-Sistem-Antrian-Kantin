require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function seedDatabase() {
    // Menggunakan environment variable dari Docker / .env
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });

    try {
        console.log('Menghubungkan ke database dan memulai seeding...');

        // Hashing password menggunakan bcrypt (DevSecOps)
        const hashedPassPenjual = await bcrypt.hash('Penjual123!', 10);
        const hashedPassMahasiswa = await bcrypt.hash('Mhs123!', 10);

        // Injeksi akun penjual
        await pool.query(
            `INSERT IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)`,
            ['penjual01', hashedPassPenjual, 'penjual']
        );

        // Injeksi akun mahasiswa
        await pool.query(
            `INSERT IGNORE INTO users (username, password_hash, role) VALUES (?, ?, ?)`,
            ['mahasiswa01', hashedPassMahasiswa, 'mahasiswa']
        );

        console.log('Seeding selesai! Data pengguna (penjual01 & mahasiswa01) berhasil dimasukkan.');
    } catch (error) {
        console.error('Gagal melakukan seeding. Pastikan database sudah siap:', error);
    } finally {
        pool.end();
    }
}

seedDatabase();