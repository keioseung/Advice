-- Supabase 대시보드의 SQL Editor에서 실행하세요
-- Storage > SQL Editor에서 이 스크립트를 실행하여 RLS 정책을 설정합니다

-- 1. 기존 버킷 확인
SELECT * FROM storage.buckets WHERE name = 'advice-media';

-- 2. 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete" ON storage.objects;

-- 3. 간단한 정책 설정 (모든 사용자 허용 - 테스트용)
CREATE POLICY "Allow all operations" ON storage.objects
FOR ALL USING (bucket_id = 'advice-media')
WITH CHECK (bucket_id = 'advice-media');

-- 4. 정책 확인
SELECT * FROM storage.policies WHERE bucket_id = 'advice-media'; 