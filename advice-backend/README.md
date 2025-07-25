# 애비의 조언 API

미래의 나, 그리고 우리 아이를 위한 특별한 메시지 API 서버입니다.

## 설치 및 실행

1. 의존성 설치:
```bash
pip install -r requirements.txt
```

2. 서버 실행:
```bash
uvicorn main:app --reload
```

서버는 `http://localhost:8000`에서 실행됩니다.

## API 문서

서버 실행 후 `http://localhost:8000/docs`에서 Swagger UI를 통해 API 문서를 확인할 수 있습니다.

## 주요 기능

- 사용자 인증 (JWT 토큰 기반)
- 조언 작성 및 조회
- 나이별 조언 필터링
- 즐겨찾기 기능
- 읽음 상태 관리

## 환경 변수

- `SECRET_KEY`: JWT 토큰 암호화 키
- `SUPABASE_URL`: Supabase 프로젝트 URL
- `SUPABASE_KEY`: Supabase API 키 