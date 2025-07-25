-- =====================================================
-- 애비의 조언 앱 데이터베이스 스키마 (완전 초기화)
-- 기존 스키마를 삭제하고 새로 생성합니다
-- =====================================================

-- 기존 스키마 완전 삭제 (CASCADE로 의존성까지 모두 삭제)
DROP SCHEMA IF EXISTS advice_app CASCADE;

-- 조언 앱을 위한 새로운 스키마 생성
CREATE SCHEMA advice_app;

-- 사용자 테이블 (조언 앱용)
CREATE TABLE advice_app.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('father', 'child')),
    name VARCHAR(100) NOT NULL,
    father_id VARCHAR(50) REFERENCES advice_app.users(user_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 조언 테이블
CREATE TABLE advice_app.advices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id VARCHAR(50) NOT NULL REFERENCES advice_app.users(user_id),
    category VARCHAR(50) NOT NULL,
    target_age INTEGER NOT NULL CHECK (target_age >= 0 AND target_age <= 100),
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 활성화
ALTER TABLE advice_app.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE advice_app.advices ENABLE ROW LEVEL SECURITY;

-- 사용자 정책
CREATE POLICY "Users can view their own data" ON advice_app.users
    FOR SELECT USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "Users can update their own data" ON advice_app.users
    FOR UPDATE USING (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "Users can insert their own data" ON advice_app.users
    FOR INSERT WITH CHECK (user_id = current_setting('request.jwt.claims', true)::json->>'user_id');

-- 조언 정책
CREATE POLICY "Fathers can view their own advices" ON advice_app.advices
    FOR SELECT USING (author_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "Children can view advices from their father" ON advice_app.advices
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM advice_app.users 
            WHERE user_id = current_setting('request.jwt.claims', true)::json->>'user_id' 
            AND father_id = advices.author_id
        )
    );

CREATE POLICY "Fathers can insert their own advices" ON advice_app.advices
    FOR INSERT WITH CHECK (author_id = current_setting('request.jwt.claims', true)::json->>'user_id');

CREATE POLICY "Users can update their own advices" ON advice_app.advices
    FOR UPDATE USING (author_id = current_setting('request.jwt.claims', true)::json->>'user_id');

-- 인덱스 생성
CREATE INDEX idx_advices_author_id ON advice_app.advices(author_id);
CREATE INDEX idx_advices_category ON advice_app.advices(category);
CREATE INDEX idx_advices_target_age ON advice_app.advices(target_age);
CREATE INDEX idx_advices_created_at ON advice_app.advices(created_at);
CREATE INDEX idx_advices_is_read ON advice_app.advices(is_read);
CREATE INDEX idx_advices_is_favorite ON advice_app.advices(is_favorite);

-- 샘플 데이터 삽입 (테스트용)
-- 아버지 사용자 생성
INSERT INTO advice_app.users (user_id, password_hash, user_type, name) VALUES
('dad001', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8J8J8J8', 'father', '김아버지'),
('dad002', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8J8J8J8', 'father', '이아버지');

-- 자녀 사용자 생성
INSERT INTO advice_app.users (user_id, password_hash, user_type, name, father_id) VALUES
('child001', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8J8J8J8', 'child', '김아들', 'dad001'),
('child002', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8J8J8J8', 'child', '이딸', 'dad002');

-- 샘플 조언 데이터
INSERT INTO advice_app.advices (author_id, category, target_age, content, is_read, is_favorite) VALUES
-- 김아버지의 조언들
('dad001', 'life', 20, '인생은 마라톤이야. 너무 서두르지 말고, 자신만의 페이스를 찾아가렴. 남과 비교하지 말고, 어제의 너보다 나은 오늘의 네가 되기 위해 노력해.', false, false),
('dad001', 'love', 25, '진정한 사랑은 상대방을 있는 그대로 받아들이는 것이야. 너를 변화시키려 하는 사람보다는, 너의 성장을 응원해주는 사람을 만나길 바란다.', true, true),
('dad001', 'career', 22, '첫 직장은 완벽할 필요 없어. 중요한 건 그곳에서 무엇을 배우고, 어떤 사람이 될 것인가야. 실수를 두려워하지 말고, 항상 배우려는 자세를 가져.', false, false),
('dad001', 'health', 30, '30대가 되면 건강이 가장 중요한 자산이야. 규칙적인 운동과 건강한 식습관을 유지해. 몸이 건강해야 마음도 건강해져.', false, false),
('dad001', 'money', 28, '돈은 도구일 뿐이야. 돈을 위해 행복을 포기하지 마. 하지만 현명하게 관리하는 법은 배워야 해. 저축과 투자의 습관을 들여.', false, false),

-- 이아버지의 조언들
('dad002', 'life', 18, '성인이 되는 순간부터 네 선택에 대한 책임이 생겨. 신중하게 생각하고 결정하되, 실수를 두려워하지 마. 실수에서 배우는 것이 가장 큰 성장이야.', false, false),
('dad002', 'friendship', 23, '진정한 친구는 어려울 때 함께 있어주는 사람이야. 많은 친구보다는 믿을 수 있는 몇 명의 친구를 가져. 그들이 네 인생의 가장 큰 보물이 될 거야.', true, false),
('dad002', 'study', 21, '대학은 지식을 배우는 곳이지만, 더 중요한 건 사람을 배우는 곳이야. 다양한 사람들과 만나고, 그들의 이야기를 들어. 그 경험이 네 인생의 밑거름이 될 거야.', false, true),
('dad002', 'hobby', 26, '일만 하다 보면 지칠 수 있어. 자신만의 취미를 가져. 그것이 네 삶의 활력소가 될 거야. 그림을 그리든, 음악을 듣든, 뭔가에 열정을 가져.', false, false),
('dad002', 'dream', 24, '꿈이 크다고 해서 부끄러워하지 마. 큰 꿈을 가진 사람이 큰 일을 이룰 수 있어. 하지만 꿈만 꾸지 말고, 그 꿈을 향해 한 걸음씩 나아가.', false, false);

-- 함수 생성: 조언 통계 조회
CREATE OR REPLACE FUNCTION advice_app.get_user_stats(user_id_param VARCHAR(50))
RETURNS TABLE (
    total_advices BIGINT,
    read_advices BIGINT,
    unread_advices BIGINT,
    favorite_advices BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_advices,
        COUNT(*) FILTER (WHERE is_read = true)::BIGINT as read_advices,
        COUNT(*) FILTER (WHERE is_read = false)::BIGINT as unread_advices,
        COUNT(*) FILTER (WHERE is_favorite = true)::BIGINT as favorite_advices
    FROM advice_app.advices 
    WHERE author_id = user_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 함수 생성: 자녀용 조언 조회 (나이별 필터링)
CREATE OR REPLACE FUNCTION advice_app.get_child_advices(child_user_id VARCHAR(50), current_age INTEGER)
RETURNS TABLE (
    id UUID,
    author_id VARCHAR(50),
    category VARCHAR(50),
    target_age INTEGER,
    content TEXT,
    is_read BOOLEAN,
    is_favorite BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.author_id,
        a.category,
        a.target_age,
        a.content,
        a.is_read,
        a.is_favorite,
        a.created_at,
        a.updated_at
    FROM advice_app.advices a
    JOIN advice_app.users u ON a.author_id = u.user_id
    WHERE u.user_id = (
        SELECT father_id 
        FROM advice_app.users 
        WHERE user_id = child_user_id
    )
    AND a.target_age <= current_age
    ORDER BY a.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 함수: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION advice_app.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON advice_app.users 
    FOR EACH ROW EXECUTE FUNCTION advice_app.update_updated_at_column();

CREATE TRIGGER update_advices_updated_at 
    BEFORE UPDATE ON advice_app.advices 
    FOR EACH ROW EXECUTE FUNCTION advice_app.update_updated_at_column();

-- 뷰 생성: 조언 통계 뷰
CREATE VIEW advice_app.advice_stats AS
SELECT 
    u.user_id,
    u.name,
    u.user_type,
    COUNT(a.id) as total_advices,
    COUNT(a.id) FILTER (WHERE a.is_read = true) as read_advices,
    COUNT(a.id) FILTER (WHERE a.is_read = false) as unread_advices,
    COUNT(a.id) FILTER (WHERE a.is_favorite = true) as favorite_advices
FROM advice_app.users u
LEFT JOIN advice_app.advices a ON u.user_id = a.author_id
GROUP BY u.user_id, u.name, u.user_type;

-- 권한 설정
GRANT USAGE ON SCHEMA advice_app TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA advice_app TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA advice_app TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA advice_app TO anon, authenticated;

-- 완료 메시지
SELECT '애비의 조언 앱 데이터베이스 스키마가 완전히 초기화되고 새로 생성되었습니다! 🎉' as message; 