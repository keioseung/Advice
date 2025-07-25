# 애비의 조언 프론트엔드

미래의 나, 그리고 우리 아이를 위한 특별한 메시지 웹 애플리케이션입니다.

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Icons**: Lucide React
- **Database**: Supabase

## 설치 및 실행

1. 의존성 설치:
```bash
npm install
```

2. 개발 서버 실행:
```bash
npm run dev
```

애플리케이션은 `http://localhost:3000`에서 실행됩니다.

## 주요 기능

### 아버지 모드
- 아이를 위한 조언 작성
- 카테고리별 조언 관리
- 읽음/안읽음 상태 확인
- 통계 대시보드

### 자녀 모드
- 나이에 맞는 조언 조회
- 즐겨찾기 기능
- 미래의 조언 미리보기
- 아버지의 마음 전달

## 프로젝트 구조

```
src/
├── app/                 # Next.js App Router
│   ├── globals.css     # 전역 스타일
│   ├── layout.tsx      # 루트 레이아웃
│   └── page.tsx        # 메인 페이지
├── components/         # React 컴포넌트
│   ├── AuthSection.tsx
│   ├── FatherDashboard.tsx
│   ├── ChildDashboard.tsx
│   ├── AdviceForm.tsx
│   ├── AdviceCard.tsx
│   └── AdviceModal.tsx
└── lib/               # 유틸리티
    └── supabase.ts    # Supabase 클라이언트
```

## 디자인 특징

- **모바일 친화적**: 반응형 디자인으로 모든 디바이스에서 최적화
- **글래스모피즘**: 현대적인 UI/UX 디자인
- **부드러운 애니메이션**: Framer Motion을 활용한 자연스러운 전환
- **직관적인 인터페이스**: 사용자 경험을 고려한 UI 설계

## 환경 설정

Supabase 설정은 `src/lib/supabase.ts`에서 관리됩니다. 