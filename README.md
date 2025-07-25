# 👨‍👦 애비의 조언

미래의 나, 그리고 우리 아이를 위한 특별한 메시지 애플리케이션입니다.

## 🌟 프로젝트 소개

아버지가 아이를 위해 작성한 조언들을 나이에 맞는 시점에 전달하는 웹 애플리케이션입니다. 
시간이 지나도 변하지 않는 아버지의 사랑과 지혜를 보관하고, 
적절한 시점에 아이에게 전달하여 더욱 의미있는 경험을 제공합니다.

## 🚀 주요 기능

### 아버지 모드
- 💝 아이를 위한 조언 작성
- 📊 카테고리별 조언 관리
- 👁️ 읽음/안읽음 상태 확인
- 📈 통계 대시보드

### 자녀 모드
- 🎯 나이에 맞는 조언 조회
- ⭐ 즐겨찾기 기능
- 🔮 미래의 조언 미리보기
- ❤️ 아버지의 마음 전달

## 🛠️ 기술 스택

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI
- **Language**: Python
- **Authentication**: JWT
- **Password Hashing**: bcrypt

### Database
- **Platform**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime

## 📁 프로젝트 구조

```
Advice/
├── advice-frontend/          # Next.js 프론트엔드
│   ├── src/
│   │   ├── app/             # Next.js App Router
│   │   ├── components/      # React 컴포넌트
│   │   └── lib/            # 유틸리티
│   ├── package.json
│   └── README.md
├── advice-backend/           # FastAPI 백엔드
│   ├── main.py             # 메인 애플리케이션
│   ├── config.py           # 설정
│   ├── requirements.txt    # Python 의존성
│   └── README.md
├── Advice.html             # 원본 HTML 파일
└── README.md              # 프로젝트 문서
```

## 🚀 시작하기

### 1. 프론트엔드 실행

```bash
cd advice-frontend
npm install
npm run dev
```

프론트엔드는 `http://localhost:3000`에서 실행됩니다.

### 2. 백엔드 실행

```bash
cd advice-backend
pip install -r requirements.txt
uvicorn main:app --reload
```

백엔드는 `http://localhost:8000`에서 실행됩니다.

### 3. API 문서

백엔드 실행 후 `http://localhost:8000/docs`에서 Swagger UI를 통해 API 문서를 확인할 수 있습니다.

## 🎨 디자인 특징

- **모바일 친화적**: 반응형 디자인으로 모든 디바이스에서 최적화
- **글래스모피즘**: 현대적인 UI/UX 디자인
- **부드러운 애니메이션**: Framer Motion을 활용한 자연스러운 전환
- **직관적인 인터페이스**: 사용자 경험을 고려한 UI 설계
- **감성적인 색상**: 따뜻하고 친근한 색상 팔레트

## 🔐 보안

- JWT 토큰 기반 인증
- bcrypt를 사용한 비밀번호 해싱
- Supabase RLS (Row Level Security) 정책
- CORS 설정으로 안전한 API 통신

## 📱 모바일 최적화

- 터치 친화적인 인터페이스
- 반응형 그리드 레이아웃
- 모바일 네이티브 애니메이션
- 최적화된 터치 타겟 크기

## 🔮 향후 계획

- [ ] 푸시 알림 기능
- [ ] 음성 메시지 지원
- [ ] 사진/영상 첨부 기능
- [ ] 소셜 로그인
- [ ] 다국어 지원
- [ ] PWA 지원

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해 주세요.

---

**애비의 조언** - 시간이 지나도 변하지 않는 아버지의 사랑을 전달합니다 ❤️ 