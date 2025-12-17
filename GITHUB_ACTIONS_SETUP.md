# GitHub Actions로 Firebase 자동 배포 설정

## 🎯 개요

코드를 GitHub에 푸시하면 자동으로 Firebase Hosting에 배포됩니다.

- `main` 또는 `master` 브랜치에 푸시 → 프로덕션 배포
- Pull Request 생성 → 미리보기 배포

## 📋 사전 준비

### 1. Firebase 프로젝트 생성

1. https://console.firebase.google.com/ 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력: `easy-file-convert` (또는 원하는 이름)
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

### 2. Firebase CLI 설치 및 로그인

```bash
# Firebase CLI 설치
npm install -g firebase-tools

# Firebase 로그인
firebase login
```

### 3. Firebase 프로젝트 초기화

```bash
# 프로젝트 루트에서 실행
firebase init hosting
```

**선택 사항:**

- **Use an existing project**: 방금 만든 프로젝트 선택
- **Public directory**: `dist` 입력
- **Single-page app**: `Yes` 선택
- **GitHub 자동 배포 설정**: `Yes` 선택 ⭐
- **GitHub 저장소**: 본인의 저장소 입력 (예: `username/easy-file-convert`)
- **자동 빌드 및 배포**: `Yes` 선택
- **자동 미리보기 배포**: `Yes` 선택

이 과정에서 `.github/workflows` 폴더와 GitHub Secret이 자동으로 설정됩니다!

## 🔑 GitHub Secret 수동 설정 (필요한 경우)

만약 자동 설정이 안 되었다면:

### 1. Firebase Service Account 키 생성

```bash
firebase init hosting:github
```

또는 수동으로:

1. Firebase Console → 프로젝트 설정 → 서비스 계정
2. "새 비공개 키 생성" 클릭
3. JSON 파일 다운로드

### 2. GitHub Secret 추가

1. GitHub 저장소 → Settings → Secrets and variables → Actions
2. "New repository secret" 클릭
3. Name: `FIREBASE_SERVICE_ACCOUNT_EASY_FILE_CONVERT`
4. Value: 다운로드한 JSON 파일의 전체 내용 붙여넣기
5. "Add secret" 클릭

## 📝 Workflow 파일 확인

`.github/workflows/` 폴더에 두 개의 파일이 있어야 합니다:

### firebase-hosting-merge.yml

- `main` 또는 `master` 브랜치에 푸시할 때 실행
- 프로덕션 환경에 배포

### firebase-hosting-pull-request.yml

- Pull Request 생성 시 실행
- 미리보기 URL 생성

## 🚀 배포 프로세스

### 첫 배포

```bash
# 1. Git 저장소 초기화 (아직 안 했다면)
git init

# 2. 모든 파일 추가
git add .

# 3. 커밋
git commit -m "Initial commit: EasyFileConvert"

# 4. GitHub 저장소 연결
git remote add origin https://github.com/username/easy-file-convert.git

# 5. 푸시 (자동 배포 시작!)
git push -u origin main
```

### 이후 배포

```bash
# 코드 수정 후
git add .
git commit -m "Update: 기능 개선"
git push

# 자동으로 배포됩니다! 🎉
```

## 📊 배포 상태 확인

### GitHub Actions 페이지

1. GitHub 저장소 → Actions 탭
2. 실행 중인 워크플로우 확인
3. 로그 확인 가능

### Firebase Console

1. Firebase Console → Hosting
2. 배포 히스토리 확인
3. 배포된 URL 확인

## 🔍 배포 URL 확인

### 프로덕션 URL

```
https://easy-file-convert.web.app
또는
https://easy-file-convert.firebaseapp.com
```

### PR 미리보기 URL

Pull Request에 자동으로 댓글로 추가됩니다:

```
https://easy-file-convert--pr-123-abc123.web.app
```

## 🎨 커스텀 도메인 설정 (선택사항)

### Firebase Console에서 설정

1. Firebase Console → Hosting → 도메인 추가
2. 본인의 도메인 입력 (예: `easyfileconvert.com`)
3. DNS 레코드 추가 (Firebase가 안내)
4. 인증서 자동 발급 (무료 SSL)

## 🐛 문제 해결

### GitHub Actions 실패

**증상**: 워크플로우가 빨간색으로 실패

**해결책**:

1. Actions 탭에서 로그 확인
2. `FIREBASE_SERVICE_ACCOUNT_*` Secret이 올바른지 확인
3. `projectId`가 Firebase 프로젝트 ID와 일치하는지 확인

### Secret 이름 불일치

**증상**: "Secret not found" 오류

**해결책**:
`.github/workflows/firebase-hosting-merge.yml` 파일에서:

```yaml
firebaseServiceAccount: "${{ secrets.FIREBASE_SERVICE_ACCOUNT_EASY_FILE_CONVERT }}"
```

이 부분의 Secret 이름이 GitHub에 등록한 이름과 정확히 일치하는지 확인

### 빌드 실패

**증상**: "npm run build" 단계에서 실패

**해결책**:

1. 로컬에서 `npm run build` 테스트
2. `package.json`의 dependencies 확인
3. Node.js 버전 확인 (워크플로우는 Node 18 사용)

## 📈 배포 최적화

### 캐시 활용

워크플로우에 이미 npm 캐시가 설정되어 있어 빌드 속도가 빠릅니다:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: "18"
    cache: "npm" # 이 부분!
```

### 조건부 배포

특정 파일만 변경되었을 때만 배포하려면:

```yaml
on:
  push:
    branches:
      - main
    paths:
      - "src/**"
      - "public/**"
      - "package.json"
```

## 🎉 완료!

이제 코드를 푸시할 때마다 자동으로 배포됩니다!

### 배포 흐름

```
코드 수정 → git push → GitHub Actions 실행 →
빌드 → Firebase 배포 → 완료! 🚀
```

### 확인 사항

- ✅ GitHub Actions 워크플로우 실행 성공
- ✅ Firebase Hosting에 배포 완료
- ✅ 배포된 URL에서 정상 작동
- ✅ COOP/COEP 헤더 적용 확인

## 📞 추가 도움말

- Firebase 문서: https://firebase.google.com/docs/hosting/github-integration
- GitHub Actions 문서: https://docs.github.com/en/actions
- 문제 발생 시: GitHub Issues에 등록
