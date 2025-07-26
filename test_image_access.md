# Supabase Storage 이미지 접근 문제 해결 가이드

## 문제 상황
이미지 URL이 올바르게 생성되지만 브라우저에서 접근할 수 없는 상황입니다.

## 해결 방법

### 1. Supabase Dashboard에서 Storage 버킷 설정 확인

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard 접속
   - 프로젝트 선택: `pwwuaxjzasfxrdgvnlvp`

2. **Storage 메뉴로 이동**
   - 왼쪽 메뉴에서 "Storage" 클릭

3. **advice-media 버킷 확인**
   - `advice-media` 버킷이 있는지 확인
   - 없다면 "New bucket" 클릭하여 생성
   - 버킷 이름: `advice-media`
   - Public bucket 체크박스 활성화

4. **RLS Policies 설정**
   - `advice-media` 버킷 클릭
   - "Policies" 탭 클릭
   - 다음 정책들 추가:

#### 공개 읽기 정책
- Policy name: "Public read access"
- Allowed operation: SELECT
- Policy definition: `true`

#### 인증된 사용자 업로드 정책
- Policy name: "Authenticated users can upload"
- Allowed operation: INSERT
- Policy definition: `auth.role() = 'authenticated'`

#### 파일 소유자 삭제 정책
- Policy name: "File owners can delete"
- Allowed operation: DELETE
- Policy definition: `auth.uid()::text = (storage.foldername(name))[1]`

### 2. 환경변수 확인

Railway에서 다음 환경변수들이 올바르게 설정되어 있는지 확인:

```
SUPABASE_URL=https://pwwuaxjzasfxrdgvnlvp.supabase.co
SUPABASE_KEY=[your-anon-key-or-service-role-key]
SUPABASE_ANON_KEY=[your-anon-key]
```

### 3. 테스트 방법

1. **브라우저에서 직접 URL 접근**
   - https://pwwuaxjzasfxrdgvnlvp.supabase.co/storage/v1/object/public/advice-media/[filename]
   - 404 에러가 나면 버킷이나 파일이 없는 것
   - 403 에러가 나면 권한 문제

2. **Supabase Dashboard에서 파일 확인**
   - Storage > advice-media 버킷에서 업로드된 파일 확인
   - 파일이 보이지 않으면 업로드 실패

### 4. 임시 해결책

만약 Supabase Storage 설정이 어렵다면, 외부 이미지 호스팅 서비스를 사용할 수 있습니다:

- Imgur
- Cloudinary
- AWS S3
- Google Cloud Storage

## 현재 상태
- 백엔드에서 이미지 업로드는 성공적으로 처리됨
- URL 생성도 올바르게 됨
- 문제는 Supabase Storage 버킷의 공개 접근 권한 설정 