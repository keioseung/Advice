-- 애비의 조언 앱 - JWT 토큰 기반 인증용 스키마
-- Supabase SQL Editor에서 실행하세요

-- Drop existing tables and views
DROP VIEW IF EXISTS advice_stats CASCADE;
DROP TABLE IF EXISTS advices CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with VARCHAR id
CREATE TABLE users (
    id VARCHAR(255) PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('father', 'child')),
    name VARCHAR(255) NOT NULL,
    father_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create advices table with VARCHAR author_id and unlock fields
CREATE TABLE advices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    target_age INTEGER NOT NULL,
    content TEXT NOT NULL,
    media_url TEXT,
    media_type VARCHAR(50),
    unlock_type VARCHAR(50) DEFAULT 'age' CHECK (unlock_type IN ('age', 'password')),
    password VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE advices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table (JWT 토큰 기반)
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own data" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (true);

-- RLS Policies for advices table (JWT 토큰 기반)
CREATE POLICY "Fathers can create advices" ON advices
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Fathers can view their own advices" ON advices
    FOR SELECT USING (true);

CREATE POLICY "Children can view advices from their father" ON advices
    FOR SELECT USING (true);

CREATE POLICY "Fathers can update their own advices" ON advices
    FOR UPDATE USING (true);

CREATE POLICY "Fathers can delete their own advices" ON advices
    FOR DELETE USING (true);

-- Create advice_stats view
CREATE VIEW advice_stats AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.user_type,
    COUNT(a.id) as total_advices,
    COUNT(CASE WHEN a.is_read = true THEN 1 END) as read_advices,
    COUNT(CASE WHEN a.is_favorite = true THEN 1 END) as favorite_advices,
    COUNT(CASE WHEN a.unlock_type = 'password' THEN 1 END) as password_advices
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
('dad', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.G', 'father', '아버지'),
('child', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.G', 'child', '자녀');

-- Insert sample advices with unlock types
INSERT INTO advices (author_id, category, target_age, content, unlock_type, password, media_url, media_type) VALUES
('dad', 'life', 20, '인생은 마라톤이야. 너무 서두르지 말고, 자신만의 페이스를 찾아가렴. 남과 비교하지 말고, 어제의 너보다 나은 오늘의 네가 되기 위해 노력해.', 'age', NULL, 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', 'image'),
('dad', 'love', 25, '진정한 사랑은 상대방을 있는 그대로 받아들이는 것이야. 너를 변화시키려 하는 사람보다는, 너의 성장을 응원해주는 사람을 만나길 바란다.', 'password', '사랑해', NULL, NULL),
('dad', 'career', 30, '30대가 되면 인생의 방향이 더욱 명확해질 거야. 지금까지의 경험을 바탕으로 자신만의 길을 찾아가길 바란다.', 'password', '꿈', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'video'),
('dad', 'health', 35, '건강은 모든 것의 기반이야. 규칙적인 운동과 균형 잡힌 식사를 통해 건강한 몸을 유지하렴.', 'age', NULL, NULL, NULL);

-- Update child user to have father_id
UPDATE users SET father_id = 'dad' WHERE id = 'child'; 