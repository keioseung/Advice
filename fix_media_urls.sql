-- 기존 데이터베이스의 media_url을 실제 Supabase Storage 형식에 맞춰 수정
-- 이 스크립트는 기존에 저장된 URL들을 올바른 형식으로 수정합니다

-- 1. 현재 상태 확인
SELECT id, media_url, 
       CASE 
         WHEN media_url LIKE '%;' THEN 'Has semicolon'
         WHEN media_url LIKE '%/advice-media//%' THEN 'Correct format (double slash)'
         WHEN media_url LIKE '%/advice-media/%' THEN 'Wrong format (single slash)'
         ELSE 'Other'
       END as status
FROM advices 
WHERE media_url IS NOT NULL;

-- 2. 세미콜론 제거
UPDATE advices 
SET media_url = TRIM(TRAILING ';' FROM TRIM(media_url))
WHERE media_url LIKE '%;';

-- 3. 슬래시 1개를 2개로 수정 (실제 Supabase Storage 형식에 맞춤)
UPDATE advices 
SET media_url = REPLACE(media_url, '/advice-media/', '/advice-media//')
WHERE media_url LIKE '%/advice-media/%' 
  AND media_url NOT LIKE '%/advice-media//%';

-- 4. 수정 후 상태 확인
SELECT id, media_url, 
       CASE 
         WHEN media_url LIKE '%;' THEN 'Still has semicolon'
         WHEN media_url LIKE '%/advice-media//%' THEN 'Correct format (double slash)'
         WHEN media_url LIKE '%/advice-media/%' THEN 'Still wrong format (single slash)'
         ELSE 'Other'
       END as status
FROM advices 
WHERE media_url IS NOT NULL;

-- 5. 빈 문자열이나 NULL로 된 media_url 정리
UPDATE advices 
SET media_url = NULL 
WHERE media_url = '' OR media_url IS NULL;

-- 6. 최종 상태 확인
SELECT COUNT(*) as total_advices,
       COUNT(media_url) as advices_with_media,
       COUNT(CASE WHEN media_url LIKE '%;' THEN 1 END) as advices_with_semicolon,
       COUNT(CASE WHEN media_url LIKE '%/advice-media//%' THEN 1 END) as advices_with_correct_format,
       COUNT(CASE WHEN media_url LIKE '%/advice-media/%' AND media_url NOT LIKE '%/advice-media//%' THEN 1 END) as advices_with_wrong_format
FROM advices; 