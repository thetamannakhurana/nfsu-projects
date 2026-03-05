#!/usr/bin/env node
/**
 * NFSU Projects Database Setup Script
 * Run: node lib/db-setup.js
 * 
 * This script:
 * 1. Creates all tables
 * 2. Seeds initial data
 * 3. Creates default admin account
 */

const { Pool } = require('pg')
const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

require('dotenv').config({ path: '.env.local' })

async function setup() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  })

  console.log('🚀 Setting up NFSU Projects Database...\n')

  try {
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql')
    const schema = fs.readFileSync(schemaPath, 'utf8')
    
    await pool.query(schema)
    console.log('✅ Schema created and seed data inserted')

    // Create admin with proper bcrypt hash
    const adminPassword = 'Admin@NFSU2024'
    const hash = await bcrypt.hash(adminPassword, 12)
    
    await pool.query(`
      UPDATE users SET password_hash = $1 
      WHERE email = 'admin@nfsu.ac.in'
    `, [hash])
    console.log('✅ Admin account created')
    console.log('   Email: admin@nfsu.ac.in')
    console.log('   Password: Admin@NFSU2024')
    console.log('   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN\n')

    // Create a sample faculty account
    const facultyPassword = 'Faculty@NFSU2024'
    const facultyHash = await bcrypt.hash(facultyPassword, 12)
    
    await pool.query(`
      INSERT INTO users (name, email, password_hash, role, campus_id, department, designation)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (email) DO NOTHING
    `, [
      'Dr. Sample Faculty',
      'faculty@nfsu.ac.in',
      facultyHash,
      'faculty',
      1,
      'Department of Cyber Security',
      'Assistant Professor'
    ])
    console.log('✅ Sample faculty account created')
    console.log('   Email: faculty@nfsu.ac.in')
    console.log('   Password: Faculty@NFSU2024\n')

    console.log('🎉 Database setup complete!')
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

setup()
