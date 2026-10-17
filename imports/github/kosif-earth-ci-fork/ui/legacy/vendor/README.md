# Libraries of the original systems (ui/legacy)

V31, V33 and V40 used to load these from cdn.jsdelivr.net. They run on the app's own origin (inside an iframe of
«الأنظمة الأصلية»), so a script fetched from a third party at run time could read everything the app keeps on the
device. They are shipped here instead, byte for byte from the npm registry, at the versions the apps were written for.
The app itself loads no third-party script.

| File | Package | npm integrity of the package tarball | SHA-256 of the file |
|---|---|---|---|
| chart-4.4.3.umd.js | chart.js@4.4.3 `dist/chart.umd.js` (already minified; jsDelivr's `chart.umd.min.js` is made from it) | sha512-qK1gkGSRYcJzqrrzdR6a+I0vQ4/R+SoODXyAjscQ/4mzuNzySaMCd+hyVxitSY1+L2fjPD1Gbn+ibNqRmwQeLw== | 6e708cb2c2b41604db1f5dec01724856ec53ac867899a1e4e2cfb8f0ace6bed9 |
| xlsx-js-style-1.2.0.bundle.js | xlsx-js-style@1.2.0 `dist/xlsx.bundle.js` | sha512-DDT4FXFSWfT4DXMSok/m3TvmP1gvO3dn0Eu/c+eXHW5Kzmp7IczNkxg/iEPnImbG9X0Vb8QhROda5eatSR/97Q== | 1c7abf2993ff2cd61e508f9268e9acda0098c9796f3925d2ba0d2579072653e2 |
| html2canvas-1.4.1.min.js | html2canvas@1.4.1 `dist/html2canvas.min.js` | sha512-fPU6BHNpsyIhr8yyMpTLLxAbkaK8ArIBcmZIRiBLiDhjeqvXolaEmDGmELFuX9I4xDcaKKcJl+TKZLqruBbmWA== | e87e550794322e574a1fda0c1549a3c70dae5a93d9113417a429016838eab8cb |
| jspdf-2.5.1.umd.min.js | jspdf@2.5.1 `dist/jspdf.umd.min.js` | sha512-hXObxz7ZqoyhxET78+XR34Xu2qFGrJJ2I2bE5w4SM8eFaFEkW2xcGRVUss360fYelwRSid/jT078kbNvmoW0QA== | 98ccf17aa10c20bb1301762618fcc9b6ab3a4e7f26b6071d64d0b41154df3875 |

To check a file: `npm pack <package>@<version>`, compare the tarball's integrity with `npm view <package>@<version>
dist.integrity`, extract it and compare the file's SHA-256 with the table. Licences: Chart.js, html2canvas and jsPDF are
MIT; xlsx-js-style is Apache-2.0 (as each package.json states).
