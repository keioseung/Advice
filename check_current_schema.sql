-- 현재 데이터베이스 스키마 확인
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'advices')
ORDER BY table_name, ordinal_position;

-- 현재 데이터 확인
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'advices', COUNT(*) FROM advices;

-- 샘플 데이터 확인
SELECT * FROM users LIMIT 5;
SELECT * FROM advices LIMIT 5; 

-- 현재 데이터베이스 상태 확인
-- 1. 전체 조언 수와 미디어가 있는 조언 수
SELECT 
    COUNT(*) as total_advices,
    COUNT(media_url) as advices_with_media,
    COUNT(CASE WHEN media_url IS NOT NULL AND media_url != '' THEN 1 END) as advices_with_valid_media
FROM advices;

-- 2. 미디어가 있는 조언들의 URL 형식 확인
SELECT 
    id,
    author_id,
    content,
    media_url,
    media_type,
    created_at,
    CASE 
        WHEN media_url LIKE '%;' THEN 'Has semicolon'
        WHEN media_url LIKE '%/advice-media//%' THEN 'Double slash (correct)'
        WHEN media_url LIKE '%/advice-media/%' THEN 'Single slash (wrong)'
        ELSE 'Other format'
    END as url_format
FROM advices 
WHERE media_url IS NOT NULL AND media_url != ''
ORDER BY created_at DESC
LIMIT 10;

-- 3. 최근 생성된 조언들의 상세 정보
SELECT 
    id,
    author_id,
    content,
    media_url,
    media_type,
    unlock_type,
    created_at,
    updated_at
FROM advices 
ORDER BY created_at DESC
LIMIT 5; 