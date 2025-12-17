# EasyFileConvert 배포 가이드

## 🚀 빠른 배포 (Firebase Hosting)

### 1. 사전 준비

#### Firebase CLI 설치

```bash
npm install -g firebase-tools
```

#### Firebase 로그인

```bash
firebase login
```

### 2. Firebase 프로젝트 설정

#### 새 프로젝트 생성 (Firebase Console)

1. https://console.firebase.google.com/ 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: easy-file-convert)
4. Google Analytics 설정 (선택사항)
5. 프로젝트 생성 완료

#### Firebase 프로젝트 초기화

```bash
firebase init hosting
```

선택 사항:

- **Use an existing project**: 방금 만든 프로젝트 선택
- **Public directory**: `dist` 입력
- **Single-page app**: `Yes` 선택
- **GitHub 자동 배포**: 선택사항 (나중에 설정 가능)

### 3. 프로덕션 빌드

```bash
npm run build
```

빌드가 완료되면 `dist` 폴더가 생성됩니다.

### 4. 배포 실행

```bash
firebase deploy
```

배포가 완료되면 URL이 표시됩니다:

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/your-project/overview
Hosting URL: https://your-project.web.app
```

## 🌐 다른 호스팅 옵션

### Vercel 배포

1. **Vercel CLI 설치**

```bash
npm install -g vercel
```

2. **배포**

```bash
vercel
```

3. **프로덕션 배포**

```bash
vercel --prod
```

**중요**: Vercel에서 COOP/COEP 헤더 설정
`vercel.json` 파일 생성:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        },
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "require-corp"
        }
      ]
    }
  ]
}
```

### Netlify 배포

1. **Netlify CLI 설치**

```bash
npm install -g netlify-cli
```

2. **빌드**

```bash
npm run build
```

3. **배포**

```bash
netlify deploy --prod --dir=dist
```

**중요**: Netlify에서 COOP/COEP 헤더 설정
`netlify.toml` 파일 생성:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Embedder-Policy = "require-corp"
```

### GitHub Pages 배포

1. **gh-pages 설치**

```bash
npm install --save-dev gh-pages
```

2. **package.json에 스크립트 추가**

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://yourusername.github.io/easy-file-convert"
}
```

3. **배포**

```bash
npm run deploy
```

**주의**: GitHub Pages는 기본적으로 COOP/COEP 헤더를 설정할 수 없어서 FFmpeg.wasm이 제대로 작동하지 않을 수 있습니다. Firebase나 Vercel을 권장합니다.

## ⚙️ 환경 변수 설정 (선택사항)

프로덕션 환경에서 추가 설정이 필요한 경우:

`.env.production` 파일 생성:

```env
VITE_APP_NAME=EasyFileConvert
VITE_MAX_FILE_SIZE=52428800
VITE_MAX_FILES=20
```

## 🔍 배포 전 체크리스트

- [ ] `npm run build` 성공적으로 완료
- [ ] `dist` 폴더 생성 확인
- [ ] 로컬에서 `npm run preview`로 프로덕션 빌드 테스트
- [ ] COOP/COEP 헤더 설정 확인
- [ ] 브라우저 콘솔에서 오류 없는지 확인
- [ ] 파일 업로드 및 변환 테스트
- [ ] 다운로드 기능 테스트
- [ ] 모바일 반응형 확인

## 🐛 배포 후 문제 해결

### FFmpeg.wasm 로딩 실패

**증상**: "Failed to load FFmpeg" 오류

**해결책**:

1. COOP/COEP 헤더가 제대로 설정되었는지 확인
2. 브라우저 개발자 도구 → Network 탭에서 헤더 확인
3. CDN 폴백이 작동하는지 확인

### SharedArrayBuffer 오류

**증상**: "SharedArrayBuffer is not defined"

**해결책**:

1. 호스팅 서비스에서 보안 헤더 설정 확인
2. HTTPS로 접속하는지 확인 (HTTP는 지원 안 됨)
3. 브라우저가 최신 버전인지 확인

### 파일 업로드 안 됨

**증상**: 파일을 드롭해도 반응 없음

**해결책**:

1. 브라우저 콘솔에서 오류 메시지 확인
2. 파일 크기가 50MB 이하인지 확인
3. 지원되는 형식인지 확인

## 📊 성능 모니터링

### Firebase Performance Monitoring (선택사항)

1. Firebase Console에서 Performance 활성화
2. SDK 추가:

```bash
npm install firebase
```

3. 초기화 코드 추가 (선택사항)

### Google Analytics (선택사항)

Firebase 프로젝트 생성 시 Analytics를 활성화하면 자동으로 추적됩니다.

## 🔄 지속적 배포 (CI/CD)

### GitHub Actions 설정

`.github/workflows/deploy.yml` 파일 생성:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: "${{ secrets.GITHUB_TOKEN }}"
          firebaseServiceAccount: "${{ secrets.FIREBASE_SERVICE_ACCOUNT }}"
          channelId: live
          projectId: your-project-id
```

## 🎉 배포 완료!

배포가 성공하면:

1. 제공된 URL로 접속
2. 파일 업로드 및 변환 테스트
3. 다양한 브라우저에서 테스트
4. 모바일 기기에서 테스트

## 📞 지원

문제가 발생하면:

- Firebase 문서: https://firebase.google.com/docs/hosting
- FFmpeg.wasm 문서: https://ffmpegwasm.netlify.app/
- GitHub Issues: 프로젝트 저장소에 이슈 등록
