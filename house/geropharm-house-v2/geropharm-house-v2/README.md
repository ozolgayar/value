# Интерактивный дом ГЕРОФАРМ — версия 2

Сначала прочитайте `INTEGRATION-V2.md`: в этой версии изменены геометрия, свет, камера и материалы. Скриншоты `browser-*.png` сняты с реального браузерного демо. Исходник 3D: `house-v2.blend`.

Основные надписи — Verdana одного размера относительно модели. Заголовки и подписи уровней имеют отдельные фиксированные размеры. Тексты карточек сохранены без изменений из присланного архива.

Содержимое:
- `public/geropharm-house.glb` — 3D-модель для Three.js / React Three Fiber.
- `public/sections.json` — согласованный текст разделов.
- `src/main.js` — пример загрузки GLB, кликов, карточек, подсветки и localStorage.
- `index.html`, `style.css` — готовое демо.
- `reconstruct_v2.py` — генератор модели, если нужно перестроить GLB.

## Запуск

```bash
npm install
npm run dev
```

Откройте адрес Vite в браузере. Для production:

```bash
npm run build
```

## Подключение в Cursor

Скопируйте `public/geropharm-house.glb` в public/assets или оставьте в public. В Three.js:

```js
const gltf = await new GLTFLoader().loadAsync('/geropharm-house.glb');
scene.add(gltf.scene);
```

У объектов есть `userData.sectionId`: `foundation`, `floor1`, `floor2`, `floor3`, `floor4`, `mission`.

Для связи с логикой обучения доступны:

```js
window.houseApp.selectSection('floor2');
window.houseApp.setCompleted(['foundation', 'floor1']);
window.houseApp.getCompleted();
```

## Важно

Это переработанная реконструкция по одному референсу, а не исходная сцена автора изображения. Скрытые стороны, логотип и знаки ценностей воспроизведены приблизительно. Мелкие надписи требуют приближения или чтения в карточке. Изменение sections.json обновляет карточки; для изменения текста на фасаде нужно пересобрать текстуры и модель.
