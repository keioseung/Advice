-- =====================================================
-- Advice App - Complete Database Setup
-- Supabase SQL Editor에서 실행하세요
-- =====================================================

-- 1. Users 테이블 생성 (age 컬럼 포함)
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

-- 2. Advices 테이블 생성
CREATE TABLE IF NOT EXISTS advices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    target_age INTEGER NOT NULL,
    content TEXT NOT NULL,
    media_url TEXT,
    media_type VARCHAR(50),
    unlock_type VARCHAR(50) DEFAULT 'age',
    password VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Storage 버킷 생성 (미디어 파일용)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- 4. RLS (Row Level Security) 활성화
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE advices ENABLE ROW LEVEL SECURITY;

-- 5. Users 테이블 RLS 정책
-- 모든 사용자가 자신의 정보를 읽을 수 있음
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = user_id);

-- 사용자가 자신의 정보를 업데이트할 수 있음
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid()::text = user_id);

-- 새로운 사용자 등록 허용
CREATE POLICY "Allow user registration" ON users
    FOR INSERT WITH CHECK (true);

-- 6. Advices 테이블 RLS 정책
-- 아버지는 자신이 작성한 조언을 읽고 수정할 수 있음
CREATE POLICY "Fathers can manage own advices" ON advices
    FOR ALL USING (author_id = auth.uid()::text);

-- 자녀는 아버지가 작성한 조언을 읽을 수 있음
CREATE POLICY "Children can read father's advices" ON advices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.user_id = auth.uid()::text 
            AND users.user_type = 'child' 
            AND users.father_id = advices.author_id
        )
    );

-- 7. Storage RLS 정책
-- 인증된 사용자는 미디어 파일을 업로드할 수 있음
CREATE POLICY "Authenticated users can upload media" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');

-- 모든 사용자가 미디어 파일을 볼 수 있음
CREATE POLICY "Public can view media" ON storage.objects
    FOR SELECT USING (bucket_id = 'media');

-- 8. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_father_id ON users(father_id);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);
CREATE INDEX IF NOT EXISTS idx_advices_author_id ON advices(author_id);
CREATE INDEX IF NOT EXISTS idx_advices_target_age ON advices(target_age);
CREATE INDEX IF NOT EXISTS idx_advices_category ON advices(category);
CREATE INDEX IF NOT EXISTS idx_advices_created_at ON advices(created_at);

-- 9. 함수 생성 (자동 업데이트 시간)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. 트리거 생성
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advices_updated_at 
    BEFORE UPDATE ON advices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. 뷰 생성 (통계용)
CREATE OR REPLACE VIEW age_distribution_stats AS
SELECT 
    target_age,
    COUNT(*) as message_count,
    category,
    author_id
FROM advices 
GROUP BY target_age, category, author_id
ORDER BY target_age;

-- 12. 샘플 데이터 (테스트용 - 선택사항)
-- 아버지 계정 샘플
INSERT INTO users (user_id, password_hash, user_type, name, age) 
VALUES 
    ('father1', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2', 'father', '김철수', NULL)
ON CONFLICT (user_id) DO NOTHING;

-- 자녀 계정 샘플
INSERT INTO users (user_id, password_hash, user_type, name, father_id, age) 
VALUES 
    ('child1', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2', 'child', '김영희', 'father1', 25)
ON CONFLICT (user_id) DO NOTHING;

-- 샘플 조언들
INSERT INTO advices (author_id, category, target_age, content, unlock_type) 
VALUES 
    ('father1', 'life', 20, '20대가 되었구나. 이제 성인이 되었으니 더욱 책임감을 가지고 살아가렴. 하지만 너무 무겁게 생각하지 말고, 젊음을 즐기면서도 미래를 준비해가길 바란다.', 'age'),
    ('father1', 'love', 25, '25살이 되었구나. 이제 진정한 사랑을 경험할 나이야. 하지만 사랑도 현명하게 해야 해. 서로를 존중하고 이해하는 마음이 진정한 사랑의 기초란다.', 'age'),
    ('father1', 'career', 30, '30대가 되었구나. 이제 진짜 인생이 시작되는 시기야. 직장에서도, 가정에서도 더욱 성숙한 모습을 보여주길 바란다. 힘들 때는 언제든 아버지에게 의지해도 돼.', 'age'),
    ('father1', 'life', 40, '40대가 되었구나. 이제 인생의 절반을 살았어. 지금까지의 경험을 바탕으로 더욱 지혜롭게 살아가길 바란다. 가족을 소중히 여기고, 건강도 잘 챙기렴.', 'age'),
    ('father1', 'life', 50, '50대가 되었구나. 이제 정말 어른이 되었어. 후배들을 이끌고, 사회에 기여하는 모습을 보여주길 바란다. 하지만 너무 무리하지 말고, 자신의 건강도 소중히 여기렴.', 'age'),
    ('father1', 'life', 60, '60대가 되었구나. 이제 정년퇴직을 앞둔 나이야. 새로운 인생의 시작이라고 생각해. 취미도 찾고, 가족과 더 많은 시간을 보내며 행복한 노후를 보내길 바란다.', 'age')
ON CONFLICT DO NOTHING;

-- 13. 확인용 쿼리
-- 테이블 구조 확인
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'advices')
ORDER BY table_name, ordinal_position;

-- 샘플 데이터 확인
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Advices' as table_name, COUNT(*) as count FROM advices;

-- 연령별 분포 확인
SELECT 
    target_age,
    COUNT(*) as message_count
FROM advices 
GROUP BY target_age 
ORDER BY target_age;

-- 완료 메시지
SELECT 'Database setup completed successfully!' as status; 