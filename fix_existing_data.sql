-- 기존 advice 테이블의 media_url에서 세미콜론 완전 제거 (더 강력한 방법)
UPDATE advices 
SET media_url = TRIM(TRAILING ';' FROM TRIM(media_url))
WHERE media_url LIKE '%;';

-- 여러 개의 세미콜론이 있을 경우를 대비한 추가 정리
UPDATE advices 
SET media_url = TRIM(TRAILING ';' FROM TRIM(media_url))
WHERE media_url LIKE '%;';

-- 최종 확인 - 세미콜론이 남아있는지 확인
SELECT id, media_url 
FROM advices 
WHERE media_url LIKE '%;';

-- 모든 media_url 확인
SELECT id, media_url 
FROM advices 
WHERE media_url IS NOT NULL;

-- 세미콜론이 완전히 제거되었는지 최종 확인
SELECT COUNT(*) as total_advices,
       COUNT(CASE WHEN media_url LIKE '%;' THEN 1 END) as with_semicolon
FROM advices 
WHERE media_url IS NOT NULL; 