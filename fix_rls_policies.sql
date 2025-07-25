-- Enable RLS on tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE advices ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Fathers can view all advices" ON advices;
DROP POLICY IF EXISTS "Children can view advices from their father" ON advices;
DROP POLICY IF EXISTS "Fathers can insert advices" ON advices;
DROP POLICY IF EXISTS "Fathers can update their own advices" ON advices;
DROP POLICY IF EXISTS "Users can read their own advices" ON advices;
DROP POLICY IF EXISTS "Users can favorite their own advices" ON advices;

-- Create policies for users table
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Create policies for advices table
CREATE POLICY "Fathers can view all advices" ON advices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.user_id = auth.uid()::text 
            AND users.user_type = 'father'
        )
    );

CREATE POLICY "Children can view advices from their father" ON advices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.user_id = auth.uid()::text 
            AND users.user_type = 'child'
            AND users.father_id = advices.author_id
        )
    );

CREATE POLICY "Fathers can insert advices" ON advices
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.user_id = auth.uid()::text 
            AND users.user_type = 'father'
            AND users.user_id = advices.author_id
        )
    );

CREATE POLICY "Fathers can update their own advices" ON advices
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.user_id = auth.uid()::text 
            AND users.user_type = 'father'
            AND users.user_id = advices.author_id
        )
    );

CREATE POLICY "Users can read their own advices" ON advices
    FOR UPDATE USING (
        auth.uid()::text = user_id
    );

CREATE POLICY "Users can favorite their own advices" ON advices
    FOR UPDATE USING (
        auth.uid()::text = user_id
    );

-- Grant necessary permissions
GRANT ALL ON users TO anon;
GRANT ALL ON advices TO anon;
GRANT USAGE ON SCHEMA public TO anon; 