-- Supabase Storage RLS 정책 설정 (파일 업로드 권한)
-- 이 정책들이 없으면 파일 업로드가 400 에러로 실패합니다

-- 1. 기존 Storage RLS 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Allow authenticated users to upload files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to read files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;

-- 2. 새로운 Storage RLS 정책 생성
-- INSERT 정책 (파일 업로드)
CREATE POLICY "Allow authenticated users to upload files" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'advice-media' AND 
    auth.uid() IS NOT NULL
);

-- SELECT 정책 (파일 읽기)
CREATE POLICY "Allow public read access" ON storage.objects
FOR SELECT USING (
    bucket_id = 'advice-media'
);

-- UPDATE 정책 (파일 수정)
CREATE POLICY "Allow authenticated users to update files" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'advice-media' AND 
    auth.uid() IS NOT NULL
);

-- DELETE 정책 (파일 삭제)
CREATE POLICY "Allow authenticated users to delete files" ON storage.objects
FOR DELETE USING (
    bucket_id = 'advice-media' AND 
    auth.uid() IS NOT NULL
);

-- 3. 버킷이 존재하는지 확인하고 없다면 생성
-- (이 부분은 Supabase Dashboard에서 수동으로 해야 할 수도 있음)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('advice-media', 'advice-media', true)
-- ON CONFLICT (id) DO NOTHING;

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

-- 업데이트된 결과 확인
SELECT id, media_url FROM advices WHERE media_url IS NOT NULL;

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