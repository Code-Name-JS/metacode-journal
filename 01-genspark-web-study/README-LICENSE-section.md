# 라이선스 구성 안내 / License Layout (README에 붙여넣기용)

이 폴더에는 아래 4개의 라이선스 파일이 들어갑니다. 저장소 루트에 복사해 주세요.

## 파일 구성

| 파일 | 역할 | 언어 |
|---|---|---|
| `LICENSE` | 소스 코드용 MIT 라이선스 본문 + 적용 범위 명시 | 영어 (법적 원본) |
| `LICENSE` | 문서·디자인·이미지·텍스트용 CC BY 4.0 전체 법적 원문 + 적용 범위 명시 | 영어 (법적 원본) |
| `LICENSE.ko.md` | 두 라이선스의 한국어 비공식 참고 번역 + README용 라이선스 섹션 | 한국어 (참고용) |
| `README-LICENSE-section.md` | README에 붙여넣을 라이선스 요약 섹션 (한/영) | 한국어 + 영어 |

## 라이선스 적용 규칙 요약

- **소스 코드** (`.html`, `.css`, `.js`, `.ts`, `.py`, `.json`, `.sh` 등) → **MIT**
- **문서·디자인·이미지·텍스트** (README, `.md`, 이미지, 다이어그램, 슬라이드, 콘텐츠 텍스트) → **CC BY 4.0**
- **Genspark 생성물** → 저장소 소유자가 권리를 보유한 범위 내에서 위 라이선스 적용 (이용자는 Genspark 이용약관 준수 책임)
- **외부 라이브러리·폰트·프레임워크** → 각자의 원래 라이선스 그대로 유지
- 개별 파일 헤더 또는 NOTICE 파일에 다른 표기가 있으면 그것이 우선

## ⚠️ 배포 전 필수 수정

1. `LICENSE`와 `LICENSE-CC-BY-4.0` 파일의 `[Gi-So-Joeng / ORGANIZATION]`를 실제 저작권자 이름으로 교체
2. 연도(`2026`)를 필요에 따라 조정
3. 저장소에 `NOTICE` 파일을 두어 제3자 자산 목록을 관리하는 것을 권장

---

## README에 붙여넣을 섹션 — 한국어

```markdown
## 라이선스 (License)

본 저장소는 이중 라이선스 구조로 제공됩니다.

| 자산 유형 | 라이선스 |
|---|---|
| 소스 코드 (`.html`, `.css`, `.js`, `.ts`, `.py` 등) | [MIT](./LICENSE) |
| 문서·디자인·이미지·텍스트 (README, `.md`, 이미지, 슬라이드 등) | [CC BY 4.0](./LICENSE) |

- Genspark 생성물은 저장소 소유자가 권리를 보유한 범위 내에서 위 라이선스가 적용됩니다.
- 외부 라이브러리·폰트 등 제3자 자산은 각자의 원래 라이선스를 따릅니다.
- 한국어 참고 번역은 [LICENSE.ko.md](./LICENSE.ko.md)를 참조하세요 (법적 효력은 영문 원본 우선).
```

## README에 붙여넣을 섹션 — English

```markdown
## License

This repository is dual-licensed.

| Asset type | License |
|---|---|
| Source code (`.html`, `.css`, `.js`, `.ts`, `.py`, etc.) | [MIT](./LICENSE) |
| Docs, design assets, images, text (README, `.md`, images, slides, etc.) | [CC BY 4.0](./LICENSE) |

- Genspark-generated output is covered by the above licenses to the extent the repository owner holds rights in it.
- External libraries, fonts, and other third-party assets keep their own original licenses.
- For an unofficial Korean reference translation, see [LICENSE.ko.md](./LICENSE.ko.md) (the English text prevails).
```
