# SEO 설정 가이드

## ✅ 완료된 작업

### 1. 메타 태그 추가 (index.html)

- 제목, 설명, 키워드 최적화
- Open Graph (페이스북, 카카오톡 공유용)
- Twitter Card
- Canonical URL

### 2. robots.txt 생성

- 모든 검색엔진 크롤러 허용
- Sitemap 위치 명시

### 3. sitemap.xml 생성

- 사이트 구조 정보 제공
- 검색엔진이 페이지를 쉽게 찾을 수 있도록

## 📝 다음 단계

### 1. Google Search Console 등록 (필수)

1. https://search.google.com/search-console 접속
2. "속성 추가" 클릭
3. URL: `https://easyfileconvert.web.app` 입력
4. 소유권 확인 방법 선택:

   - **HTML 파일 업로드** (가장 쉬움)
   - HTML 태그
   - Google Analytics
   - Google Tag Manager
   - 도메인 이름 공급업체

5. 소유권 확인 후:
   - Sitemap 제출: `https://easyfileconvert.web.app/sitemap.xml`
   - URL 검사 도구로 색인 생성 요청

### 2. 색인 생성 요청

- Search Console에서 "URL 검사" 메뉴
- `https://easyfileconvert.web.app` 입력
- "색인 생성 요청" 클릭
- 보통 1-2일 내에 구글 검색에 노출 시작

### 3. 추가 최적화 (선택사항)

#### Google Analytics 추가

```html
<!-- index.html의 <head>에 추가 -->
<script
  async
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    dataLayer.push(arguments);
  }
  gtag("js", new Date());
  gtag("config", "G-XXXXXXXXXX");
</script>
```

#### 구조화된 데이터 (Schema.org)

```html
<!-- index.html의 <head>에 추가 -->
<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "EasyFileConvert",
    "description": "무료 비디오 WebP 변환기",
    "url": "https://easyfileconvert.web.app",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "KRW"
    }
  }
</script>
```

## 🔍 검색 키워드 전략

현재 타겟 키워드:

- 비디오 webp 변환
- 동영상 webp
- 무료 변환기
- mp4 webp
- video to webp converter
- 애니메이션 webp

## 📊 예상 타임라인

- **1-3일**: Google이 사이트 발견
- **1-2주**: 검색 결과에 나타나기 시작
- **1-3개월**: 검색 순위 안정화

## 💡 팁

1. **콘텐츠 추가**: 블로그나 사용 가이드 페이지 추가하면 SEO에 도움
2. **백링크**: 다른 사이트에서 링크 받기
3. **소셜 미디어**: 페이스북, 트위터 등에 공유
4. **정기 업데이트**: 사이트를 자주 업데이트하면 크롤링 빈도 증가
