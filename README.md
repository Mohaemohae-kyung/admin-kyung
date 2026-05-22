# 🛡️ Mohaemohae Admin System (모하해-경 관리자 시스템)

본 리포지토리는 **모하해-경** 서비스의 독립형 관리자 시스템으로, 전체 리소스(회원, 예약, 결제, 게시판 등)의 통계 조회 및 관리를 담당하는 독립 백엔드와 프론트엔드로 구성되어 있습니다.

---

## 📂 프로젝트 구조

```text
admin-kyung/
├── admin-backend/      # Spring Boot 기반 독립 관리자 백엔드 API 서버 (Port: 8081)
└── admin-frontend/     # React + Vite + Tailwind CSS 기반 관리자 웹 대시보드
```

---

## ⚙️ 1. admin-backend (백엔드)

기존 메인 서비스 데이터베이스(`KYUNG_USER` 스키마)에 직접 접근하여 관리 기능을 제공합니다. 메인 소스 코드에 전혀 의존하지 않는 **완전 자립식 독립 프로젝트**로 설계되어 있어, 본 폴더만으로 완벽하게 빌드 및 구동됩니다.

### 실행 환경 요구사항
- **Java**: JDK 17
- **Database**: Oracle DB 연동 정보가 올바르게 기입된 `.env` 파일 (또는 환경변수) 필요

### 빌드 및 실행 방법
1. **환경 변수 파일 설정 (`admin-backend/.env`)**
   메인 프로젝트의 `.env` 환경 변수 설정값(Oracle DB URL, Username, Password, JWT Secret 등)을 동일하게 작성합니다.
2. **프로젝트 빌드**
   ```powershell
   cd admin-backend
   ./gradlew build -x test
   ```
3. **애플리케이션 실행**
   ```powershell
   ./gradlew bootRun
   ```

---

## 💻 2. admin-frontend (프론트엔드)

Vite + React 환경으로 구축된 반응형 대시보드 웹 어플리케이션입니다.

### 실행 방법
1. **의존성 패키지 설치**
   ```powershell
   cd admin-frontend
   npm install
   ```
2. **개발 서버 구동**
   ```powershell
   npm run dev
   ```

---

## 🔒 독립 구조 설계 특징 (Decoupling)
- **독립 컴파일**: `Back-Kyung` 서비스와의 소스 의존성이 완전히 제거되었습니다.
- **테이블 공유**: 동일 데이터베이스에 직접 접근하며, 메인 도메인의 JPA 엔티티(`kung_backend` 패키지)를 복제·내장하여 데이터 일관성을 유지합니다.
