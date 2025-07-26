-- 기존 advice 테이블의 media_url에서 세미콜론 제거
UPDATE advices 
SET media_url = TRIM(TRAILING ';' FROM media_url)
WHERE media_url LIKE '%;';

-- 확인용 쿼리
SELECT id, media_url 
FROM advices 
WHERE media_url LIKE '%;'; 