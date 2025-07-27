# Advice - 아버지의 특별한 선물 🎁

아버지가 미래의 자녀를 위해 준비하는 특별한 메시지와 조언을 담는 웹 애플리케이션입니다.

## ✨ 주요 기능

### 👨‍👦 아버지 기능
- **메시지 작성**: 자녀의 특정 나이에 받을 수 있는 메시지 작성
- **미디어 첨부**: 사진, 동영상 등 미디어 파일 첨부 가능
- **연령별 분류**: 메시지를 특정 나이대별로 분류하여 저장
- **잠금 기능**: 패스워드로 보호된 특별한 메시지 설정
- **통계 확인**: 작성한 메시지들의 연령별 분포 통계 확인

### 👶 자녀 기능
- **나이 설정**: 현재 나이를 설정하여 받을 수 있는 메시지 확인
- **메시지 수신**: 현재 나이에 맞는 메시지들을 확인
- **미래 메시지**: 패스워드를 통해 미래의 메시지를 미리 확인 가능
- **즐겨찾기**: 마음에 드는 메시지를 즐겨찾기로 저장
- **통계 확인**: 아버지가 준비한 메시지들의 연령별 분포 통계 확인

## 🚀 새로 추가된 기능

### 🎂 자녀 나이 설정
- 자녀가 자신의 현재 나이를 설정할 수 있습니다
- 나이 설정에 따라 받을 수 있는 메시지가 정확히 표시됩니다
- 0-120세 범위 내에서 나이를 설정할 수 있습니다

### 📊 연령별 메시지 통계
- **아버지**: 자신이 작성한 메시지들의 연령별 분포를 확인할 수 있습니다
- **자녀**: 아버지가 준비한 메시지들의 연령별 분포를 확인할 수 있습니다
- **연령대별 분류**: 어린이(0-12세), 청소년(13-19세), 20대, 30대, 40대, 50대, 60대 이상으로 분류
- **상세 통계**: 각 나이별 메시지 개수와 분포를 시각적으로 확인

## 🛠 기술 스택

### Frontend
- **Next.js 14**: React 기반 풀스택 프레임워크
- **TypeScript**: 타입 안전성 보장
- **Tailwind CSS**: 유틸리티 퍼스트 CSS 프레임워크
- **Framer Motion**: 부드러운 애니메이션 효과
- **Lucide React**: 아이콘 라이브러리

### Backend
- **FastAPI**: Python 기반 고성능 웹 프레임워크
- **Supabase**: PostgreSQL 기반 백엔드 서비스
- **JWT**: 인증 토큰 관리
- **bcrypt**: 비밀번호 해싱

### Database
- **PostgreSQL**: 관계형 데이터베이스
- **Row Level Security (RLS)**: 데이터 보안
- **Storage**: 미디어 파일 저장

## 📁 프로젝트 구조

```
Advice/
├── advice-frontend/          # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/             # Next.js 14 App Router
│   │   ├── components/      # React 컴포넌트
│   │   └── lib/            # 유틸리티 함수
│   └── package.json
├── advice-backend/           # FastAPI 백엔드
│   ├── main.py             # 메인 API 서버
│   ├── config.py           # 설정 파일
│   └── requirements.txt
└── *.sql                   # 데이터베이스 스키마 파일들
```

## 🚀 설치 및 실행

### 1. 프론트엔드 설정
```bash
cd advice-frontend
npm install
npm run dev
```

### 2. 백엔드 설정
```bash
cd advice-backend
pip install -r requirements.txt
python main.py
```

### 3. 환경 변수 설정
프론트엔드 `.env.local` 파일:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

백엔드 `.env` 파일:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET=your_jwt_secret
```

## 📊 데이터베이스 스키마

### Users 테이블
```sql
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_type VARCHAR(50) NOT NULL CHECK (user_type IN ('father', 'child')),
    name VARCHAR(255) NOT NULL,
    father_id VARCHAR(255),
    age INTEGER CHECK (age >= 0 AND age <= 120),  -- 자녀 나이 필드
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Advices 테이블
```sql
CREATE TABLE advices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    target_age INTEGER NOT NULL,
    content TEXT NOT NULL,
    media_url TEXT,
    media_type VARCHAR(50),
    unlock_type VARCHAR(50) DEFAULT 'age',
    password VARCHAR(255),
    is_read BOOLEAN DEFAULT FALSE,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔐 보안 기능

- **JWT 인증**: 안전한 사용자 인증
- **Row Level Security (RLS)**: 데이터베이스 레벨 보안
- **비밀번호 해싱**: bcrypt를 사용한 안전한 비밀번호 저장
- **CORS 설정**: 안전한 크로스 오리진 요청 처리

## 🎨 UI/UX 특징

- **반응형 디자인**: 모바일, 태블릿, 데스크톱 모든 기기 지원
- **글래스모피즘**: 현대적인 유리 효과 디자인
- **부드러운 애니메이션**: Framer Motion을 활용한 자연스러운 전환 효과
- **직관적인 인터페이스**: 사용자 친화적인 UI/UX
- **다크/라이트 모드**: 사용자 선호도에 따른 테마 지원

## 📱 사용 방법

### 아버지 계정으로 시작하기
1. 회원가입 시 `user_type`을 'father'로 설정
2. 자녀의 이름과 함께 가족 정보 입력
3. 자녀의 특정 나이에 받을 메시지 작성
4. 필요시 미디어 파일 첨부
5. 통계에서 작성한 메시지들의 분포 확인

### 자녀 계정으로 시작하기
1. 회원가입 시 `user_type`을 'child'로 설정
2. 아버지의 ID를 `father_id`로 입력
3. 현재 나이 설정
4. 현재 나이에 받을 수 있는 메시지 확인
5. 패스워드를 통해 미래 메시지 미리 확인 가능
6. 통계에서 아버지가 준비한 메시지들의 분포 확인

## 🔄 API 엔드포인트

### 인증
- `POST /auth/register` - 회원가입
- `POST /auth/login` - 로그인
- `GET /users/me` - 현재 사용자 정보

### 메시지 관리
- `POST /advices` - 메시지 작성
- `GET /advices` - 메시지 목록 조회
- `GET /advices/{id}` - 특정 메시지 조회
- `PUT /advices/{id}` - 메시지 수정
- `DELETE /advices/{id}` - 메시지 삭제

### 사용자 관리
- `PUT /users/age` - 자녀 나이 설정

### 통계
- `GET /stats` - 기본 통계
- `GET /stats/age-distribution` - 연령별 분포 통계

### 미디어
- `POST /upload-media` - 미디어 파일 업로드

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

**Made with ❤️ for fathers and their children** 