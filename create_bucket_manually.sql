-- Supabase 대시보드의 SQL Editor에서 실행하세요
-- Storage > SQL Editor에서 이 스크립트를 실행하여 버킷을 수동으로 생성합니다

-- 1. advice-media 버킷 생성
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'advice-media',
  'advice-media',
  true,
  10485760, -- 10MB
  ARRAY['image/*', 'video/*']
);

-- 2. 버킷이 생성되었는지 확인
SELECT * FROM storage.buckets WHERE name = 'advice-media';

-- 3. RLS 정책 설정 (공개 읽기 허용)
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'advice-media');

-- 4. 업로드 정책 설정 (인증된 사용자만 업로드 가능)
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'advice-media' 
  AND auth.role() = 'authenticated'
);

-- 5. 정책 확인
SELECT * FROM storage.policies WHERE bucket_id = 'advice-media'; 