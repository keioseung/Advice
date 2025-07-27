-- Add age column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS age INTEGER CHECK (age >= 0 AND age <= 120);

-- Add comment to the column
COMMENT ON COLUMN users.age IS '자녀의 현재 나이 (0-120세)'; 