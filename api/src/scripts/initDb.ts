import fs from 'fs'
import path from 'path'
import mysql from 'mysql2/promise'

// Simple helper to read SQL file
const readSql = (filePath: string) => {
  return fs.readFileSync(filePath, 'utf8')
}

// Execute SQL file statements one by one and ignore benign errors
async function executeSqlFileSequential(conn: mysql.Connection, filePath: string) {
  const raw = readSql(filePath)
  // Remove BOM and split by semicolon
  const cleaned = raw.replace(/^\uFEFF/, '')
  const lines = cleaned
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(s => s.length > 0)

  for (const stmt of lines) {
    // Skip pure comments or USE statement will be handled separately
    const firstLine = stmt.split('\n')[0].trim()
    if (firstLine.startsWith('--') || firstLine.length === 0) continue
    try {
      await conn.query(stmt)
    } catch (err: any) {
      const code = err?.code as string
      const msg = String(err?.sqlMessage || err?.message || '')
      const ignorable = [
        'ER_DUP_ENTRY',
        'ER_TABLE_EXISTS_ERROR',
        'ER_DUP_FIELDNAME',
        'ER_CANT_CREATE_FT_INDEX',
        'ER_DUP_KEYNAME',
        'ER_INDEX_REBUILD',
      ]
      // Ignore if index/table/row already exists
      if (ignorable.includes(code) || /already exists|Duplicate entry/i.test(msg)) {
        console.warn(`⚠️ Ignored SQL error (${code}): ${msg}`)
        continue
      }
      console.error('❌ SQL failed:', stmt.slice(0, 200) + '...')
      throw err
    }
  }
}

async function run() {
  const host = process.env.DB_HOST || '127.0.0.1'
  const port = parseInt(process.env.DB_PORT || '3306')
  const user = process.env.DB_USERNAME || 'root'
  const password = process.env.DB_PASSWORD || 'root'
  const database = process.env.DB_DATABASE || 'artwork_booking'

  const initPath = path.join(__dirname, '../../database/init.sql')
  const samplePath = path.join(__dirname, '../../database/sample_data.sql')

  console.log('▶️ Connecting to MySQL to initialize database...')
  const conn = await mysql.createConnection({
    host,
    port,
    user,
    password,
    multipleStatements: true,
  })

  try {
    console.log('▶️ Executing init.sql sequentially...')
    await executeSqlFileSequential(conn, initPath)

    // Switch to target database and patch schema BEFORE loading sample data
    await conn.query(`USE \`${database}\``)

    console.log('▶️ Patching schema to align with current backend entities...')
    // First, add missing columns for users (since other patches depend on users.name)
    try {
      await conn.query("ALTER TABLE users ADD COLUMN name varchar(100) NULL")
    } catch (e) { /* may exist */ }
    try {
      await conn.query("ALTER TABLE users ADD COLUMN location varchar(255) NULL")
    } catch (e) { /* may exist */ }
    try {
      await conn.query("ALTER TABLE users ADD COLUMN bio text NULL")
    } catch (e) { /* may exist */ }
    try {
      await conn.query("ALTER TABLE users ADD COLUMN status ENUM('active','inactive','pending') NOT NULL DEFAULT 'active'")
    } catch (e) { /* may exist */ }
    try {
      await conn.query("ALTER TABLE users ADD COLUMN isEmailVerified boolean NOT NULL DEFAULT 0")
    } catch (e) { /* may exist */ }
    // Populate user.name and defaults
    try {
      await conn.query(`
        UPDATE users
        SET name = COALESCE(NULLIF(CONCAT(COALESCE(firstName,''), COALESCE(lastName,'')), ''), email)
        WHERE name IS NULL OR name = ''
      `)
    } catch (e) {
      await conn.query(`
        UPDATE users
        SET name = email
        WHERE name IS NULL OR name = ''
      `)
    }
    try {
      await conn.query("UPDATE users SET status = 'active' WHERE status IS NULL OR status = ''")
    } catch (e) { /* ignore */ }
    try {
      await conn.query("UPDATE users SET isEmailVerified = 0 WHERE isEmailVerified IS NULL")
    } catch (e) { /* ignore */ }

    // Add missing columns for artists
    try {
      await conn.query("ALTER TABLE artists ADD COLUMN name varchar(100) NULL")
    } catch (e) { /* column may already exist */ }
    try {
      await conn.query("ALTER TABLE artists ADD COLUMN status ENUM('active','inactive','pending') NOT NULL DEFAULT 'active'")
    } catch (e) { /* may exist */ }
    try {
      await conn.query("ALTER TABLE artists ADD COLUMN totalArtworks INT NOT NULL DEFAULT 0")
    } catch (e) { /* may exist */ }
    try {
      await conn.query("ALTER TABLE artists ADD COLUMN totalSales DECIMAL(10,2) NOT NULL DEFAULT 0")
    } catch (e) { /* may exist */ }
    // Columns required by current entity definition
    try {
      await conn.query("ALTER TABLE artists ADD COLUMN avatar TEXT NULL")
    } catch (e) { /* may exist */ }
    try {
      await conn.query("ALTER TABLE artists ADD COLUMN studio varchar(255) NULL")
    } catch (e) { /* may exist */ }
    try {
      await conn.query("ALTER TABLE artists ADD COLUMN location varchar(255) NULL")
    } catch (e) { /* may exist */ }
    try {
      await conn.query("ALTER TABLE artists ADD COLUMN specialties TEXT NULL")
    } catch (e) { /* may exist */ }
    try {
      await conn.query("ALTER TABLE artists ADD COLUMN education TEXT NULL")
    } catch (e) { /* may exist */ }
    try {
      await conn.query("ALTER TABLE artists ADD COLUMN awards TEXT NULL")
    } catch (e) { /* may exist */ }
    // Populate artist.name from users if available (robust to missing first/last name)
    try {
      await conn.query(`
        UPDATE artists a
        JOIN users u ON a.userId = u.id
        SET a.name = COALESCE(NULLIF(CONCAT(COALESCE(u.firstName,''), COALESCE(u.lastName,'')), ''), u.name, u.email)
        WHERE a.name IS NULL OR a.name = ''
      `)
    } catch (e) {
      // Fallback if users table doesn't have firstName/lastName
      await conn.query(`
        UPDATE artists a
        JOIN users u ON a.userId = u.id
        SET a.name = COALESCE(u.name, u.email)
        WHERE a.name IS NULL OR a.name = ''
      `)
    }

    // Backfill specialties from legacy specialization column if present
    try {
      await conn.query(`
        UPDATE artists
        SET specialties = specialization
        WHERE (specialties IS NULL OR specialties = '')
          AND specialization IS NOT NULL
          AND specialization <> ''
      `)
    } catch (e) { /* ignore if legacy column missing */ }

    // Provide default avatar to avoid frontend image errors
    try {
      await conn.query(`
        UPDATE artists
        SET avatar = COALESCE(NULLIF(avatar, ''), 'https://picsum.photos/seed/artist/600/600')
        WHERE avatar IS NULL OR avatar = ''
      `)
    } catch (e) { /* ignore */ }

    // Add missing columns for artworks
    try {
      await conn.query("ALTER TABLE artworks ADD COLUMN imageUrl TEXT NULL")
    } catch (e) { /* may exist */ }
    try {
      await conn.query("ALTER TABLE artworks ADD COLUMN status ENUM('available','sold','reserved','hidden') NOT NULL DEFAULT 'available'")
    } catch (e) { /* may exist */ }
    try {
      await conn.query("ALTER TABLE artworks ADD COLUMN type ENUM('painting','sculpture','photography','digital','mixed_media','ceramics','print') NOT NULL DEFAULT 'painting'")
    } catch (e) { /* may exist */ }
    try {
      await conn.query("ALTER TABLE artworks ADD COLUMN stock INT NOT NULL DEFAULT 1")
    } catch (e) { /* may exist */ }
    // Physical dimensions and materials
    try {
      await conn.query("ALTER TABLE artworks ADD COLUMN width DECIMAL(10,2) NULL")
    } catch (e) { /* may exist */ }
    try {
      await conn.query("ALTER TABLE artworks ADD COLUMN height DECIMAL(10,2) NULL")
    } catch (e) { /* may exist */ }
    try {
      await conn.query("ALTER TABLE artworks ADD COLUMN depth DECIMAL(10,2) NULL")
    } catch (e) { /* may exist */ }
    try {
      await conn.query("ALTER TABLE artworks ADD COLUMN unit VARCHAR(20) NULL")
    } catch (e) { /* may exist */ }
    try {
      await conn.query("ALTER TABLE artworks ADD COLUMN materials VARCHAR(100) NULL")
    } catch (e) { /* may exist */ }
    try {
      await conn.query("ALTER TABLE artworks ADD COLUMN year INT NULL")
    } catch (e) { /* may exist */ }
    try {
      await conn.query("ALTER TABLE artworks ADD COLUMN isFeatured BOOLEAN NOT NULL DEFAULT 0")
    } catch (e) { /* may exist */ }
    // Some legacy schemas lack isActive although entity requires it
    try {
      await conn.query("ALTER TABLE artworks ADD COLUMN isActive BOOLEAN NOT NULL DEFAULT 1")
    } catch (e) { /* may exist */ }
    try {
      await conn.query("ALTER TABLE artworks ADD COLUMN rating DECIMAL(3,2) NOT NULL DEFAULT 0")
    } catch (e) { /* may exist */ }
    try {
      await conn.query("ALTER TABLE artworks ADD COLUMN reviewCount INT NOT NULL DEFAULT 0")
    } catch (e) { /* may exist */ }
    try {
      await conn.query("ALTER TABLE artworks ADD COLUMN additionalImages TEXT NULL")
    } catch (e) { /* may exist */ }

    // After schema is patched, load sample data (now columns exist)
    console.log('▶️ Executing sample_data.sql sequentially...')
    await executeSqlFileSequential(conn, samplePath)

    // Populate artwork columns from existing data (safe defaults without referencing legacy columns)
    await conn.query(`
      UPDATE artworks
      SET imageUrl = COALESCE(NULLIF(imageUrl, ''), 'https://picsum.photos/seed/artwork/800/800')
      WHERE imageUrl IS NULL OR imageUrl = ''
    `)

    await conn.query(`
      UPDATE artworks
      SET status = COALESCE(NULLIF(status, ''), 'available')
      WHERE status IS NULL OR status = ''
    `)

    await conn.query(`
      UPDATE artworks
      SET rating = COALESCE(NULLIF(rating, ''), 0), reviewCount = COALESCE(NULLIF(reviewCount, ''), 0)
      WHERE rating IS NULL OR reviewCount IS NULL OR rating = '' OR reviewCount = ''
    `)

    // Ensure isActive defaults to true for existing records
    await conn.query(`
      UPDATE artworks
      SET isActive = COALESCE(isActive, 1)
      WHERE isActive IS NULL
    `)

    // Ensure artworks have categoryId and artistId set to sensible defaults
    // Determine default categoryId (prefer 'cat-painting-001', otherwise first active category)
    const [catRows] = await conn.query<any[]>(
      "SELECT id FROM categories WHERE id = 'cat-painting-001' LIMIT 1"
    )
    let defaultCategoryId: string | null = (catRows && catRows[0]?.id) || null
    if (!defaultCategoryId) {
      const [catsAny] = await conn.query<any[]>(
        'SELECT id FROM categories WHERE isActive = 1 ORDER BY sortOrder ASC, name ASC LIMIT 1'
      )
      defaultCategoryId = (catsAny && catsAny[0]?.id) || null
    }

    // Determine default artistId (prefer 'artist-001-uuid', otherwise first active artist)
    const [artistRows] = await conn.query<any[]>(
      "SELECT id FROM artists WHERE id = 'artist-001-uuid' LIMIT 1"
    )
    let defaultArtistId: string | null = (artistRows && artistRows[0]?.id) || null
    if (!defaultArtistId) {
      const [artistsAny] = await conn.query<any[]>(
        'SELECT id FROM artists WHERE isActive = 1 ORDER BY createdAt ASC LIMIT 1'
      )
      defaultArtistId = (artistsAny && artistsAny[0]?.id) || null
    }

    if (defaultCategoryId) {
      await conn.query(
        'UPDATE artworks SET categoryId = ? WHERE categoryId IS NULL OR categoryId = ""',
        [defaultCategoryId]
      )
    }

    if (defaultArtistId) {
      await conn.query(
        'UPDATE artworks SET artistId = ? WHERE artistId IS NULL OR artistId = ""',
        [defaultArtistId]
      )
    }

    // Add missing column for users.name and populate
    try {
      await conn.query("ALTER TABLE users ADD COLUMN name varchar(100) NULL")
    } catch (e) { /* may exist */ }
    // Add other missing user columns required by current entity
    try {
      await conn.query("ALTER TABLE users ADD COLUMN location varchar(255) NULL")
    } catch (e) { /* may exist */ }
    try {
      await conn.query("ALTER TABLE users ADD COLUMN bio text NULL")
    } catch (e) { /* may exist */ }
    try {
      await conn.query("ALTER TABLE users ADD COLUMN status ENUM('active','inactive','pending') NOT NULL DEFAULT 'active'")
    } catch (e) { /* may exist */ }
    try {
      await conn.query("ALTER TABLE users ADD COLUMN isEmailVerified boolean NOT NULL DEFAULT 0")
    } catch (e) { /* may exist */ }
    try {
      await conn.query(`
        UPDATE users
        SET name = COALESCE(NULLIF(CONCAT(COALESCE(firstName,''), COALESCE(lastName,'')), ''), email)
        WHERE name IS NULL OR name = ''
      `)
    } catch (e) {
      // Fallback when firstName/lastName do not exist
      await conn.query(`
        UPDATE users
        SET name = email
        WHERE name IS NULL OR name = ''
      `)
    }
    // Ensure status populated and email verification defaults
    try {
      await conn.query("UPDATE users SET status = 'active' WHERE status IS NULL OR status = ''")
    } catch (e) { /* ignore */ }
    try {
      await conn.query("UPDATE users SET isEmailVerified = 0 WHERE isEmailVerified IS NULL")
    } catch (e) { /* ignore */ }

    console.log('✅ Database initialized and patched successfully')
  } finally {
    await conn.end()
  }
}

run().catch(err => {
  console.error('❌ Database initialization failed:', err)
  process.exit(1)
})