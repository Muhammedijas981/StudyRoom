const { pool } = require('../config/database');

const migrateUsers = async () => {
    try {
        console.log('Migrating users table...');
        
        // Add major column
        await pool.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'major') THEN
                    ALTER TABLE users ADD COLUMN major VARCHAR(255);
                    RAISE NOTICE 'Added major column';
                END IF;
            END $$;
        `);

        // Add bio column
        await pool.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bio') THEN
                    ALTER TABLE users ADD COLUMN bio TEXT;
                    RAISE NOTICE 'Added bio column';
                END IF;
            END $$;
        `);

        console.log('Migration completed successfully');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        pool.end();
    }
};

migrateUsers();
