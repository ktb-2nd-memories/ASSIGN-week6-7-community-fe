# 커뮤니티 웹 애플리케이션

3주차 과제에 event 처리, fetch 적용한 코드입니다.

**주제** 순수 Vanilla JS로 만든 아무 말 대잔치 커뮤니티<br>
**Skills** HTML5, CSS3, Vailla JS

## 주요 기능
#### 1. 인증
  - 회원가입 (이메일, 비밀번호, 닉네임, 프로필 이미지)
  - 로그인/로그아웃
  - 회원정보 수정 (프로필 이미지, 닉네임)
  - 비밀번호 변경
  - 회원탈퇴

#### 2. 게시글
  - 게시글 전체 목록 조회 (제목, 본문, 이미지)
  - 게시글 상세 조회
  - 게시글 작성/수정/삭제
  - 게시글 조회수 확인
  - 좋아요 기능

#### 3. 댓글
  - 댓글 작성/수정/삭제
  - 댓글 수 확인

## 특징
- 외부 라이브러리나 프레임워크 없이 순수 JavaScript로 개발
- LocalStorage를 활용하여 데이터 저장 및 관리
- 입력 필드에서 실시간으로 폼 유효성 검증

## 프로젝트 구조
```
COMMUNITY-FE/
├── assets/
│   └── images/
│
├── pages/  # 개별 페이지 HTML 파일
│   └── data/ # 로컬 json 파일
│
├── scripts/  # JavaScript 파일
│   └── components/
│
└── styles/  # CSS 파일
    └── components/
```

## 화면 구성
<img width="1011" alt="스크린샷 2025-02-18 오후 9 50 32" src="https://github.com/user-attachments/assets/b8ac8623-562f-49d0-a52b-3d4cbe22b473" />
