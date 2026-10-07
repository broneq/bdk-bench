---
schema: 1
id: E-0444xg7m
kind: lint-full
ticket: A-eq1itdbh
group: gate
target: 2026-10-06-b1-repository-bootstrap-harness
at: 2026-10-06T21:29:14.021Z
author: Przemysław Broniszewski <przemek@broniszewski.net>
source: agent:runner
tree-hash: sha256:08e71e376782312a6c8afaf7fc86a790003a5207ae954261cd37e8caeb037a7c
tree:
  - path: .github/workflows/ci.yml
    hash: sha256:3ad1a19d8944f436295b968ca6080f7043327de32feb76b60b72054a88c4bb40
  - path: .gitignore
    hash: sha256:c494f9f0e606a9a5183e527ba5261867df06824092cbceb9b1a680f7705a06ee
  - path: .prettierignore
    hash: sha256:15d36add4d01ff65585ef8522c08d55ba042ec5ccb6f695bb8c98fee7cf85200
  - path: .prettierrc.json
    hash: sha256:17e52b4b4570adda7e416ddf5a3920821b5dd15c144b64c249836f0523cd8a80
  - path: checklist/*.yaml
    hash: absent
  - path: eslint.config.mjs
    hash: sha256:3ec74dbe53790a4a55822e78eb3fc82e5175e496c7c8f10d0aa8b422fbfb40b5
  - path: harness/assert.test.ts
    hash: sha256:d67a9e6179591e60eb2dec332e91b9c279e3cfc3d7dc6f868b8ac499b89aded2
  - path: harness/assert.ts
    hash: sha256:74de0e57e4e9c139f2f961d7569dafefb202837dc10e617f5f4af8cf1113806b
  - path: harness/budget.test.ts
    hash: sha256:0e591271e50ed446dd226f3b090a0da609b8e83b01afd1ba17b740a41de3365a
  - path: harness/budget.ts
    hash: sha256:e7fc6149a75eadbe98b353e51e85d0093f5edf87310d087595e0d3a0da5d2740
  - path: harness/cli.test.ts
    hash: sha256:23faceae721b9d8dffeb1a160c647d8f4c7750e49e8f45b57389e892f38f787c
  - path: harness/cli.ts
    hash: sha256:e762daecc6607f66dfb50d87638481f5968eb623e49c33c62f492e6cb778182f
  - path: harness/compare.test.ts
    hash: sha256:eee51199aea86dc5b55dfa0238ec8433f88ac6338954d69e8028d8baee019b57
  - path: harness/compare.ts
    hash: sha256:cc71498dbaa9dbc54eea46456d89b0017613e1cf510d2c884d4ef2f5262329b5
  - path: harness/fixture.test.ts
    hash: sha256:0150a2a0c3491224910701da22ea99052de7a92dff5c45aa2f636edfce43b741
  - path: harness/fixture.ts
    hash: sha256:ef4436e9820a72bcfadcf21a0e0997720b38628d60a20f298739115ae557cab3
  - path: harness/hook.test.ts
    hash: sha256:d948cdedd6e9bb62315a1f1d358013a29e308224cc8ffe374085a00fbc45e0d1
  - path: harness/hook.ts
    hash: sha256:5114e721e5b73e5d92170066e5b17154fd2347c45a8b7d2eae6730f8b1b328c0
  - path: harness/isolation.test.ts
    hash: sha256:659f6fc3e6997d2dbf7e2f9ff9b92d8008d88c0d204866250e603c502720250d
  - path: harness/isolation.ts
    hash: sha256:ce911d238f75a793b9bf8f05e45248c3b7884ff0431bf2062a6201638030e4de
  - path: harness/judge.ts
    hash: sha256:99e97d5ed697f2949dbceb0a32a670d609f6de0ff7f171ea2677bf8ec54b3492
  - path: harness/main.ts
    hash: sha256:ac708695aab08e2c0bb8e482821ccc589348f2d2e621ca1f83b76f28c98b83a2
  - path: harness/paths.test.ts
    hash: sha256:702ee0d5936ab544c331601b178e16f5ccbb6a88ec204840816113d22b732dbb
  - path: harness/paths.ts
    hash: sha256:742d3d5b6f08209e03f04c2ef9e14ec3c35d67499f90d03bd78a015d86685812
  - path: harness/provider.test.ts
    hash: sha256:09d636e6df687d4f3856a05066b86a810e0db5f1ff6554dfe25341e90c5bac9a
  - path: harness/provider.ts
    hash: sha256:bc51e5e576e5c3b640b63193a12342b26dc5ebab797cc55b21b079c2de6f0cec
  - path: harness/providers.test.ts
    hash: sha256:8f89558af1031bdc69767c7fe32c6b1e9ad029c54226b0f14bf2eb3f0b9dc3a0
  - path: harness/providers.ts
    hash: sha256:78a5dfd3c4d42818bc6045ad93855c395f14032c28b4b80a1eaf269c9e1cadfe
  - path: harness/regrade.test.ts
    hash: sha256:50929ebd6e8a4bc37a38dc6dcdccf52c4017493629f4e802b57d2f7c94f8858c
  - path: harness/regrade.ts
    hash: sha256:6e52f88de252e9749a1a20f2fd18da75526f9a61c7d877e5bb4670254d94636a
  - path: harness/results.test.ts
    hash: sha256:3e7877f5001a624ec28cde6df210af04a6991b38f4cf9c04857bd5a4bf5d7c6e
  - path: harness/results.ts
    hash: sha256:21daf29e10d0f9c7498f766d29ea1faa9f5c3e5d4e86bf1db1dd02fc1db2d3a6
  - path: harness/runner.test.ts
    hash: sha256:ae74d48d2369cad1d9b66db586d5ad0aec3400b647fdf8084f25df0a7f00b802
  - path: harness/runner.ts
    hash: sha256:32759893ca484efeaf315ed1df57372c611be26a06b51c6588adda444f538814
  - path: harness/series.test.ts
    hash: sha256:cf9ab8106f438b1e198f0a9523750e3f3519144f84d3ba7c4cacdcd8c43b72f2
  - path: harness/series.ts
    hash: sha256:adbb4d051334136dc1fc246fce5596f883eec2adccd147d34379dbf3bc79366a
  - path: harness/stats.test.ts
    hash: sha256:a2f742c3aae57980059b8cccae678b36dc97e886a3d3dacd7cc4f26afbc4f4e5
  - path: harness/stats.ts
    hash: sha256:c1ba148689e788bfe119c24eae701804d12af110a822a972eaf3416792bdb29e
  - path: harness/suites/smoke/hooks.test.ts
    hash: sha256:eafba7f974e05ae6d270e7db043750f312a2199eb0918616d27a86daaef67eb2
  - path: harness/suites/smoke/hooks.ts
    hash: sha256:1f8622dc1c6486bbad65cb155459d55353f7f1b9fcc77518d9398eced2ce1010
  - path: harness/suites/smoke/suite.test.ts
    hash: sha256:cd62741236236597ccea584efc0b983062eb4943b2dea7e9780e1ca53df49ea5
  - path: harness/suites/smoke/suite.ts
    hash: sha256:41a89065452411bc5171d34f5655d07ab571fc6e8cdfd154247d25c48e8e14a2
  - path: harness/tools.test.ts
    hash: sha256:7a23ea5118f85619158e9c712cf6288397f049fb72798c98cf75da4f870cb92a
  - path: harness/tools.ts
    hash: sha256:5ab6bf4b8d6f1882f24804dec0038b3db19c3666cc7a7cc333507829d571a29d
  - path: harness/transcript.test.ts
    hash: sha256:e358f6140004c7fc2e7ae7c71ecf9c222d631d77311b6cb51b3ba6b10c81ea04
  - path: harness/transcript.ts
    hash: sha256:9d8df6b8c272c62fc05ea8b63fcfdd48bfab8aca5bcdfbdc92d56e0b20e5bae2
  - path: harness/tree.test.ts
    hash: sha256:0b3985ce662d07653ed89b356a255c9f3b825fdc82bd7fdb68b4cebebd6d4d6d
  - path: harness/tree.ts
    hash: sha256:b5836b5060f49e7db6e017f07181331dfc5b1f43fc906462d69e3197380203a1
  - path: package.json
    hash: sha256:d0255b0c4663b3d6aff46bdbf637660d99da4ec9fbf72f3f2b57b7fd09ab7faf
  - path: patches/promptfoo@0.123.1.patch
    hash: sha256:7fc5965b5bed16dc586b7da7f61fe4f8b3c5afc9ef81240d6738cea2249851ff
  - path: pnpm-lock.yaml
    hash: sha256:efc4423237323c53dd4e1e6cd76babe41b1198a56577acea9b2a5fb1ae8c68eb
  - path: pnpm-workspace.yaml
    hash: sha256:04a1bbebd078d5a0fc6a8b5dc59bf102319bbde63c8e2787754cff93e5cca870
  - path: tasks/*/checks.yaml
    hash: absent
  - path: tasks/*/task.yaml
    hash: absent
  - path: tsconfig.json
    hash: sha256:115dd33790e519c9348085813625885c51010d6a7655ab928a83b92b19303d7d
  - path: versions.json
    hash: sha256:453f6986b8fb5a57a2f5d1c25d0d5c16626810a00f87d8d60edf33be0cddc80b
  - path: vitest.config.ts
    hash: sha256:eae2a66383efc01399d40a052d2faebdf881c9be26d91cac3e3f561f93d6e699
files:
  - path: .bdk/changes/2026-10-06-b1-repository-bootstrap-harness/evidence/2026-10-06-b1-repository-bootstrap-harness-E-0444xg7m-lint-full.txt
    hash: sha256:9d87aeada2f594c68de939fb32680aff3aa9c6b97eb966b3b9934e413bbfef2d
    stored: committed
verdict: pass
citations:
  - .bdk/.machine/checks/lint-full.txt:10=All matched files use Prettier code style!
---
