# EasyFileConvert - 설계 문서

## 개요

EasyFileConvert는 React와 FFmpeg.wasm을 기반으로 한 클라이언트 사이드 비디오 → WebP 변환기입니다. 모든 처리가 브라우저에서 이루어져 개인정보 보호와 빠른 변환을 제공합니다.

## 아키텍처

### 전체 구조

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React UI      │    │   State Manager  │    │  FFmpeg.wasm    │
│                 │◄──►│                  │◄──►│                 │
│ - FileDropzone  │    │ - File Queue     │    │ - Video Convert │
│ - FileListItem  │    │ - Progress Track │    │ - Frame Count   │
│ - Controls      │    │ - Preview State  │    │ - Quality Ctrl  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 컴포넌트 계층

```
App
├── QualitySelector
├── FileDropzone
├── FileListItem[]
│   ├── StatusIcon
│   ├── ProgressBar
│   ├── ActionButtons
│   └── PreviewSection
└── ConversionControls
```

## 컴포넌트 및 인터페이스

### 1. App.jsx (메인 컨테이너)

**책임:**

- 전역 상태 관리 (파일 목록, 변환 상태, 미리보기)
- 변환 큐 처리 로직
- 파일 생명주기 관리

**주요 상태:**

```javascript
const [files, setFiles] = useState([]); // 파일 목록
const [selectedQuality, setSelectedQuality] = useState("standard");
const [isConverting, setIsConverting] = useState(false);
const [processingTrigger, setProcessingTrigger] = useState(0);
const [previewFileId, setPreviewFileId] = useState(null);
```

**파일 객체 구조:**

```javascript
{
  id: string,                    // 고유 식별자
  file: File,                   // 원본 파일 객체
  originalUrl: string,          // 원본 파일 URL (미리보기용)
  status: "IDLE" | "READY" | "PROCESSING" | "COMPLETED" | "ERROR",
  progressStep: string,         // 현재 작업 단계
  currentFrame: number,         // 현재 처리 프레임
  totalFrames: number,          // 총 프레임 수
  webpUrl?: string,            // 변환된 WebP URL
  webpSize?: number,           // 변환된 파일 크기
  error?: string               // 오류 메시지
}
```

### 2. FileListItem.jsx (파일 항목)

**책임:**

- 개별 파일 상태 표시
- 진행률 시각화
- 액션 버튼 제공
- 미리보기 기능

**상태 기반 UI:**

- **IDLE**: 시작 버튼 (노란색)
- **READY**: 대기 취소 버튼 (주황색)
- **PROCESSING**: 진행률 표시
- **COMPLETED**: 다운로드 + 미리보기 버튼
- **ERROR**: 재시도 버튼

### 3. FFmpeg 통합 (utils/ffmpeg.js)

**주요 기능:**

- FFmpeg.wasm 초기화 및 로딩
- 총 프레임 수 사전 계산 (빠른 카운팅)
- 실시간 진행률 추적
- 메모리 정리

**변환 파이프라인:**

```
1. 파일 업로드 → FFmpeg 가상 파일시스템
2. 총 프레임 수 계산 (ffmpeg -f null)
3. WebP 변환 (ffmpeg -f webp)
4. 진행률 콜백 (frame= 로그 파싱)
5. 결과 파일 읽기 및 Blob 생성
6. 가상 파일시스템 정리
```

## 데이터 모델

### 파일 상태 전이도

```
IDLE ──start──► READY ──process──► PROCESSING ──success──► COMPLETED
 ▲               │                      │
 │               │                      │
 └──cancel───────┘                      └──error──► ERROR
 ▲                                                    │
 └────────────────────retry──────────────────────────┘
```

### 품질 설정

```javascript
const QUALITY_OPTIONS = {
  low: { label: "저용량", ffmpegArgs: ["-q:v", "30"] },
  standard: { label: "표준", ffmpegArgs: ["-q:v", "75"] },
  high: { label: "고화질", ffmpegArgs: ["-q:v", "95"] },
  lossless: { label: "무손실", ffmpegArgs: ["-lossless", "1"] },
};
```

## 정확성 속성

_속성은 모든 유효한 시스템 실행에서 참이어야 하는 특성 또는 동작입니다. 속성은 인간이 읽을 수 있는 사양과 기계 검증 가능한 정확성 보장 사이의 다리 역할을 합니다._

### 속성 1: 순차 처리 보장

_모든_ 변환 요청에 대해, 시스템은 한 번에 최대 하나의 파일만 PROCESSING 상태에 있도록 보장해야 한다
**검증: 요구사항 3.1, 3.2**

### 속성 2: 진행률 정확성

_모든_ PROCESSING 상태 파일에 대해, 표시되는 백분율은 (currentFrame / totalFrames \* 100)과 일치해야 한다
**검증: 요구사항 4.1, 4.2**

### 속성 3: 메모리 정리 일관성

_모든_ 파일 삭제 또는 애플리케이션 종료 시, 관련된 모든 Object URL이 해제되어야 한다
**검증: 요구사항 10.1**

### 속성 4: 상태 전이 유효성

_모든_ 파일 상태 변경에 대해, 유효한 상태 전이 경로만 허용되어야 한다
**검증: 요구사항 5.1, 5.2, 5.3**

### 속성 5: 미리보기 단일성

_모든_ 시점에서, 최대 하나의 파일만 미리보기가 활성화되어야 한다
**검증: 요구사항 6.5, 10.3**

### 속성 6: 파일 크기 일관성

_모든_ 완료된 변환에 대해, 저장된 webpSize는 실제 생성된 Blob의 크기와 일치해야 한다
**검증: 요구사항 7.1, 7.2**

## 오류 처리

### 변환 오류

- FFmpeg 실행 실패 → ERROR 상태로 전환
- 메모리 부족 → 경고 메시지 및 파일 제한
- 지원되지 않는 형식 → 업로드 단계에서 차단

### 네트워크 오류

- FFmpeg.wasm 로딩 실패 → CDN 폴백
- 로컬 파일 접근 실패 → 사용자 알림

### UI 오류

- 잘못된 파일 드롭 → 시각적 피드백
- 브라우저 호환성 → 기능 감지 및 대안 제공

## 테스트 전략

### 단위 테스트

- 파일 상태 전이 로직
- 진행률 계산 함수
- 메모리 정리 함수
- 품질 설정 적용

### 속성 기반 테스트

- **라이브러리**: fast-check (JavaScript)
- **반복 횟수**: 최소 100회
- **태그 형식**: `**Feature: video-to-webp-converter, Property {number}: {property_text}**`

각 정확성 속성은 단일 속성 기반 테스트로 구현되어야 합니다:

1. **순차 처리 테스트**: 무작위 파일 목록에서 PROCESSING 상태 파일이 1개 이하인지 확인
2. **진행률 정확성 테스트**: 무작위 프레임 값에서 백분율 계산이 정확한지 확인
3. **메모리 정리 테스트**: 파일 삭제 후 Object URL이 해제되는지 확인
4. **상태 전이 테스트**: 무작위 상태 변경이 유효한 경로인지 확인
5. **미리보기 단일성 테스트**: 여러 미리보기 토글 후 하나만 활성화되는지 확인
6. **파일 크기 일관성 테스트**: 변환된 Blob 크기와 저장된 크기가 일치하는지 확인

### 통합 테스트

- 전체 변환 파이프라인
- 파일 업로드부터 다운로드까지
- 오류 복구 시나리오

### 성능 테스트

- 대용량 파일 처리
- 다중 파일 변환
- 메모리 사용량 모니터링

## 성능 최적화

### 메모리 관리

- Object URL 즉시 해제
- FFmpeg 가상 파일시스템 정리
- 미리보기 단일 활성화

### 사용자 경험

- 진행률 실시간 업데이트
- 반응형 UI 유지
- 오류 상황 명확한 피드백

### 브라우저 최적화

- SharedArrayBuffer 활용
- Web Worker 모드 (FFmpeg.wasm)
- 청크 단위 파일 처리

## 보안 고려사항

### 클라이언트 사이드 보안

- 파일이 서버로 전송되지 않음
- 로컬 처리로 개인정보 보호
- CORS 정책 준수

### 브라우저 보안

- SharedArrayBuffer 보안 헤더 필요
- Content Security Policy 설정
- 악성 파일 업로드 방지

## 배포 및 호스팅

### 정적 호스팅

- Firebase Hosting 권장
- COOP/COEP 헤더 설정 필수
- CDN을 통한 FFmpeg.wasm 로딩

### 브라우저 호환성

- Chrome 88+ (SharedArrayBuffer)
- Firefox 89+ (COOP/COEP)
- Safari 15+ (WebAssembly)

## 향후 개선 사항

### 기능 확장

- 추가 출력 형식 지원 (GIF, APNG)
- 비디오 편집 기능 (자르기, 크기 조정)
- 배치 설정 (파일별 다른 품질)

### 성능 개선

- Web Worker 활용한 병렬 처리
- 프로그레시브 로딩
- 캐싱 전략

### 사용자 경험

- 드래그 앤 드롭 개선
- 키보드 단축키
- 접근성 향상
