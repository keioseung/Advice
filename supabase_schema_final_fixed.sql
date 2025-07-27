-- 애비의 조언 앱 - 미디어 기능 포함 스키마 (최종 수정 버전)
-- Supabase SQL Editor에서 실행하세요

-- Drop existing tables and views
DROP VIEW IF EXISTS advice_stats CASCADE;
DROP TABLE IF EXISTS advices CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with VARCHAR id
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('father', 'child')),
    name VARCHAR(255) NOT NULL,
    father_id VARCHAR(255),
    age INTEGER CHECK (age >= 0 AND age <= 120),  -- 자녀 나이 필드 추가
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create advices table with VARCHAR author_id
CREATE TABLE advices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    target_age INTEGER NOT NULL,
    content TEXT NOT NULL,
    media_url TEXT,
    media_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE advices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can insert their own data" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = id);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid()::text = id);

-- RLS Policies for advices table
CREATE POLICY "Fathers can create advices" ON advices
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::text 
            AND users.user_type = 'father'
        )
    );

CREATE POLICY "Fathers can view their own advices" ON advices
    FOR SELECT USING (
        author_id = auth.uid()::text
    );

CREATE POLICY "Children can view advices from their father" ON advices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid()::text 
            AND users.user_type = 'child'
            AND users.father_id = advices.author_id
        )
    );

CREATE POLICY "Fathers can update their own advices" ON advices
    FOR UPDATE USING (author_id = auth.uid()::text);

CREATE POLICY "Fathers can delete their own advices" ON advices
    FOR DELETE USING (author_id = auth.uid()::text);

-- Create advice_stats view
CREATE VIEW advice_stats AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.user_type,
    COUNT(a.id) as total_advices,
    COUNT(CASE WHEN a.is_read = true THEN 1 END) as read_advices,
    COUNT(CASE WHEN a.is_favorite = true THEN 1 END) as favorite_advices
FROM users u
LEFT JOIN advices a ON u.id = a.author_id
WHERE u.user_type = 'father'
GROUP BY u.id, u.name, u.user_type;

-- Grant permissions
GRANT ALL ON users TO anon;
GRANT ALL ON advices TO anon;
GRANT ALL ON advice_stats TO anon;

-- Insert sample data
INSERT INTO users (id, password_hash, user_type, name) VALUES
('dad001', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.G', 'father', '김아버지'),
('child001', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.G', 'child', '김자녀');

-- Insert sample advices
INSERT INTO advices (author_id, category, target_age, content) VALUES
('dad001', '인생', 20, '인생에서 가장 중요한 것은 건강이다.'),
('dad001', '학업', 18, '공부는 자신을 위한 투자다.'),
('dad001', '관계', 25, '사람과의 관계를 소중히 하라.'); 