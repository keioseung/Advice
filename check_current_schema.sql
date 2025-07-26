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