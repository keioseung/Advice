-- 애비의 조언 앱 - 미디어 기능 포함 스키마 (간단한 버전)
-- Supabase SQL Editor에서 실행하세요

-- 기존 뷰 삭제 (에러 방지)
DROP VIEW IF EXISTS advice_stats;

-- 사용자 테이블 (public 스키마, VARCHAR 사용)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('father', 'child')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 조언 테이블 (미디어 필드 추가, public 스키마)
CREATE TABLE IF NOT EXISTS advices (
    id VARCHAR(255) PRIMARY KEY,
    author_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    target_age INTEGER NOT NULL,
    content TEXT NOT NULL,
    media_url TEXT, -- 미디어 URL (이미지/영상)
    media_type VARCHAR(20) CHECK (media_type IN ('image', 'video')), -- 미디어 타입
    is_read BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_advices_author_id ON advices(author_id);
CREATE INDEX IF NOT EXISTS idx_advices_target_age ON advices(target_age);
CREATE INDEX IF NOT EXISTS idx_advices_category ON advices(category);
CREATE INDEX IF NOT EXISTS idx_advices_created_at ON advices(created_at);

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_advices_updated_at ON advices;
CREATE TRIGGER update_advices_updated_at 
    BEFORE UPDATE ON advices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE advices ENABLE ROW LEVEL SECURITY;

-- 기존 RLS 정책 삭제
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Fathers can view all advices" ON advices;
DROP POLICY IF EXISTS "Children can view advices from their father" ON advices;
DROP POLICY IF EXISTS "Fathers can insert advices" ON advices;
DROP POLICY IF EXISTS "Fathers can update their advices" ON advices;
DROP POLICY IF EXISTS "Fathers can delete their advices" ON advices;

-- RLS 정책들

-- 사용자 테이블 정책
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid()::text = id);

-- 조언 테이블 정책
CREATE POLICY "Fathers can view all advices" ON advices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = author_id AND user_type = 'father'
        )
    );

CREATE POLICY "Children can view advices from their father" ON advices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = author_id AND user_type = 'father'
        )
    );

CREATE POLICY "Fathers can insert advices" ON advices
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = author_id AND user_type = 'father'
        )
    );

CREATE POLICY "Fathers can update their advices" ON advices
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = author_id AND user_type = 'father'
        )
    );

CREATE POLICY "Fathers can delete their advices" ON advices
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = author_id AND user_type = 'father'
        )
    );

-- 통계 뷰 생성
CREATE OR REPLACE VIEW advice_stats AS
SELECT 
    u.id as user_id,
    u.name,
    u.user_type,
    COUNT(a.id) as total_advices,
    COUNT(CASE WHEN a.is_read THEN 1 END) as read_advices,
    COUNT(CASE WHEN NOT a.is_read THEN 1 END) as unread_advices,
    COUNT(CASE WHEN a.is_favorite THEN 1 END) as favorite_advices,
    COUNT(CASE WHEN a.media_url IS NOT NULL THEN 1 END) as media_advices
FROM users u
LEFT JOIN advices a ON u.id = a.author_id
GROUP BY u.id, u.name, u.user_type;

-- 기존 데이터 삭제 (새로운 스키마로 시작)
DELETE FROM advices;
DELETE FROM users;

-- 샘플 데이터 (미디어 포함)
INSERT INTO users (id, email, password_hash, name, user_type) VALUES
('father123', 'father@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8DmG', '김철수', 'father'),
('child123', 'child@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8DmG', '김영희', 'child')
ON CONFLICT (id) DO NOTHING;

-- 샘플 조언 데이터 (미디어 포함)
INSERT INTO advices (id, author_id, category, target_age, content, media_url, media_type) VALUES
('advice1', 'father123', 'life', 20, '인생은 마라톤이야. 너무 서두르지 말고, 자신만의 페이스를 찾아가렴. 남과 비교하지 말고, 어제의 너보다 나은 오늘의 네가 되기 위해 노력해.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', 'image'),
('advice2', 'father123', 'love', 25, '진정한 사랑은 상대방을 있는 그대로 받아들이는 것이야. 너를 변화시키려 하는 사람보다는, 너의 성장을 응원해주는 사람을 만나길 바란다.', NULL, NULL),
('advice3', 'father123', 'career', 30, '30대가 되면 인생의 방향이 더욱 명확해질 거야. 지금까지의 경험을 바탕으로 자신만의 길을 찾아가길 바란다.', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'video'),
('advice4', 'father123', 'health', 18, '건강은 모든 것의 기본이야. 규칙적인 운동과 균형 잡힌 식사를 잊지 마. 몸이 건강해야 마음도 건강해져.', NULL, NULL),
('advice5', 'father123', 'money', 22, '돈은 도구일 뿐이야. 돈을 위해 행복을 포기하지 마. 하지만 현명하게 관리하는 법은 배워야 해.', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop', 'image')
ON CONFLICT (id) DO NOTHING;

-- 권한 설정
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- 테이블 확인
SELECT 'Users Table' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Advices Table', COUNT(*) FROM advices
UNION ALL
SELECT 'Media Advices', COUNT(*) FROM advices WHERE media_url IS NOT NULL; 