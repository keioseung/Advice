-- 애비의 조언 앱 - 미디어 기능 포함 스키마
-- Supabase SQL Editor에서 실행하세요

-- 기존 스키마 정리 (필요시)
-- DROP SCHEMA IF EXISTS advice_app CASCADE;

-- 스키마 생성
CREATE SCHEMA IF NOT EXISTS advice_app;

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS advice_app.users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('father', 'child')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 조언 테이블 (미디어 필드 추가)
CREATE TABLE IF NOT EXISTS advice_app.advices (
    advice_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES advice_app.users(user_id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_advices_author_id ON advice_app.advices(author_id);
CREATE INDEX IF NOT EXISTS idx_advices_target_age ON advice_app.advices(target_age);
CREATE INDEX IF NOT EXISTS idx_advices_category ON advice_app.advices(category);
CREATE INDEX IF NOT EXISTS idx_advices_created_at ON advice_app.advices(created_at);

-- 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION advice_app.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON advice_app.users 
    FOR EACH ROW EXECUTE FUNCTION advice_app.update_updated_at_column();

CREATE TRIGGER update_advices_updated_at 
    BEFORE UPDATE ON advice_app.advices 
    FOR EACH ROW EXECUTE FUNCTION advice_app.update_updated_at_column();

-- Row Level Security (RLS) 활성화
ALTER TABLE advice_app.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE advice_app.advices ENABLE ROW LEVEL SECURITY;

-- RLS 정책들

-- 사용자 테이블 정책
CREATE POLICY "Users can view their own profile" ON advice_app.users
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own profile" ON advice_app.users
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- 조언 테이블 정책
CREATE POLICY "Fathers can view all advices" ON advice_app.advices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM advice_app.users 
            WHERE user_id = author_id AND user_type = 'father'
        )
    );

CREATE POLICY "Children can view advices from their father" ON advice_app.advices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM advice_app.users 
            WHERE user_id = author_id AND user_type = 'father'
        )
    );

CREATE POLICY "Fathers can insert advices" ON advice_app.advices
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM advice_app.users 
            WHERE user_id = author_id AND user_type = 'father'
        )
    );

CREATE POLICY "Fathers can update their advices" ON advice_app.advices
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM advice_app.users 
            WHERE user_id = author_id AND user_type = 'father'
        )
    );

CREATE POLICY "Fathers can delete their advices" ON advice_app.advices
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM advice_app.users 
            WHERE user_id = author_id AND user_type = 'father'
        )
    );

-- 통계 뷰 생성
CREATE OR REPLACE VIEW advice_app.advice_stats AS
SELECT 
    u.user_id,
    u.name,
    u.user_type,
    COUNT(a.advice_id) as total_advices,
    COUNT(CASE WHEN a.is_read THEN 1 END) as read_advices,
    COUNT(CASE WHEN NOT a.is_read THEN 1 END) as unread_advices,
    COUNT(CASE WHEN a.is_favorite THEN 1 END) as favorite_advices,
    COUNT(CASE WHEN a.media_url IS NOT NULL THEN 1 END) as media_advices
FROM advice_app.users u
LEFT JOIN advice_app.advices a ON u.user_id = a.author_id
GROUP BY u.user_id, u.name, u.user_type;

-- 샘플 데이터 (미디어 포함)
INSERT INTO advice_app.users (email, password_hash, name, user_type) VALUES
('father@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8DmG', '김철수', 'father'),
('child@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8DmG', '김영희', 'child')
ON CONFLICT (email) DO NOTHING;

-- 아버지 ID 가져오기
DO $$
DECLARE
    father_id UUID;
BEGIN
    SELECT user_id INTO father_id FROM advice_app.users WHERE email = 'father@example.com';
    
    -- 샘플 조언 데이터 (미디어 포함)
    INSERT INTO advice_app.advices (author_id, category, target_age, content, media_url, media_type) VALUES
    (father_id, 'life', 20, '인생은 마라톤이야. 너무 서두르지 말고, 자신만의 페이스를 찾아가렴. 남과 비교하지 말고, 어제의 너보다 나은 오늘의 네가 되기 위해 노력해.', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop', 'image'),
    (father_id, 'love', 25, '진정한 사랑은 상대방을 있는 그대로 받아들이는 것이야. 너를 변화시키려 하는 사람보다는, 너의 성장을 응원해주는 사람을 만나길 바란다.', NULL, NULL),
    (father_id, 'career', 30, '30대가 되면 인생의 방향이 더욱 명확해질 거야. 지금까지의 경험을 바탕으로 자신만의 길을 찾아가길 바란다.', 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4', 'video'),
    (father_id, 'health', 18, '건강은 모든 것의 기본이야. 규칙적인 운동과 균형 잡힌 식사를 잊지 마. 몸이 건강해야 마음도 건강해져.', NULL, NULL),
    (father_id, 'money', 22, '돈은 도구일 뿐이야. 돈을 위해 행복을 포기하지 마. 하지만 현명하게 관리하는 법은 배워야 해.', 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop', 'image')
    ON CONFLICT DO NOTHING;
END $$;

-- 권한 설정
GRANT USAGE ON SCHEMA advice_app TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA advice_app TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA advice_app TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA advice_app TO anon, authenticated;

-- 테이블 확인
SELECT 'Users Table' as table_name, COUNT(*) as count FROM advice_app.users
UNION ALL
SELECT 'Advices Table', COUNT(*) FROM advice_app.advices
UNION ALL
SELECT 'Media Advices', COUNT(*) FROM advice_app.advices WHERE media_url IS NOT NULL; 