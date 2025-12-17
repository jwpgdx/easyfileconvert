# EasyFileConvert - 클라이언트 사이드 WebP 변환기

브라우저에서 안전하고 빠르게 비디오를 WebP로 변환하는 웹 애플리케이션입니다.

## 주요 특징

- **완전 클라이언트 사이드**: 파일이 서버로 전송되지 않아 개인정보 보호
- **ffmpeg.wasm 기반**: Web Worker를 통한 안정적인 변환 처리
- **대량 처리**: 최대 20개 파일 동시 업로드 및 순차 변환
- **품질 옵션**: 저용량, 표준, 고화질, 무손실 4가지 옵션
- **실시간 진행률**: 각 파일별 변환 진행 상황 표시
- **ZIP 다운로드**: 모든 변환 완료 후 일괄 다운로드

## 기술 스택

- **Frontend**: React 18 + JavaScript
- **Styling**: Tailwind CSS
- **변환 엔진**: ffmpeg.wasm v0.12+
- **파일 처리**: react-dropzone, jszip, file-saver
- **빌드 도구**: Vite

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## 보안 헤더 설정

SharedArrayBuffer 사용을 위해 다음 헤더가 필요합니다:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Firebase Hosting 사용 시 `firebase.json`에 이미 설정되어 있습니다.

## 지원 형식

- **입력**: MP4, AVI, MOV, MKV, WebM, FLV, WMV
- **출력**: WebP
- **최대 파일 크기**: 50MB
- **최대 파일 개수**: 20개

## 품질 옵션

1. **저용량** (`-q:v 30`): 작은 파일 크기, 낮은 품질
2. **표준** (`-q:v 75`): 균형잡힌 품질과 크기 (기본값)
3. **고화질** (`-q:v 95`): 높은 품질, 큰 파일 크기
4. **무손실** (`-lossless 1`): 최고 품질, 매우 큰 파일 크기

## 메모리 관리

- 변환 완료 후 `URL.revokeObjectURL()` 호출
- ffmpeg 가상 파일 시스템 정리
- Web Worker를 통한 메인 스레드 보호

## 폴더 구조

```
easy-file-convert/
├── src/
│   ├── components/
│   │   ├── QualitySelector.jsx
│   │   ├── FileDropzone.jsx
│   │   ├── FileListItem.jsx
│   │   └── ConversionControls.jsx
│   ├── utils/
│   │   ├── ffmpeg.js
│   │   └── download.js
│   ├── constants/
│   │   └── quality.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
├── firebase.json
└── README.md
```
