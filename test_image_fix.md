# 이미지 로딩 문제 해결 가이드

## 1단계: 백엔드 재시작 확인
```bash
cd advice-backend
uvicorn main:app --reload
```

## 2단계: 새 이미지 업로드 테스트
1. 아버지 페이지에서 새 조언 작성
2. 이미지 첨부
3. 백엔드 로그 확인:
   - `Original Supabase URL:` 
   - `Cleaned media_url:`

## 3단계: 기존 데이터 정리
Supabase SQL Editor에서 실행:
```sql
-- 현재 상태 확인
SELECT id, media_url 
FROM advices 
WHERE media_url LIKE '%;';

-- 세미콜론 제거
UPDATE advices 
SET media_url = TRIM(TRAILING ';' FROM media_url)
WHERE media_url LIKE '%;';
```

## 4단계: 브라우저 캐시 클리어
- Ctrl + F5 (강제 새로고침)
- 또는 개발자 도구 > Network 탭 > Disable cache 체크

## 5단계: Supabase Storage 확인
1. Supabase Dashboard > Storage
2. `advice-media` 버킷 확인
3. 파일들이 실제로 업로드되었는지 확인

## 문제가 지속되면:
1. 브라우저 콘솔 에러 메시지
2. 백엔드 로그 메시지
3. Supabase Storage 상태
를 알려주세요! 