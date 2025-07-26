-- Temporarily disable RLS for testing
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE advices DISABLE ROW LEVEL SECURITY;
 
-- Grant all permissions to anon role
GRANT ALL ON users TO anon;
GRANT ALL ON advices TO anon;
GRANT USAGE ON SCHEMA public TO anon; 