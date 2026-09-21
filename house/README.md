# Интерактивный дом ГЕРОФАРМ

Содержимое:
- `public/geropharm-house.glb` — 3D-модель для Three.js / React Three Fiber.
- `public/sections.json` — согласованный текст разделов.
- `src/main.js` — пример загрузки GLB, кликов, карточек, подсветки и localStorage.
- `index.html`, `style.css` — готовое демо.
- `build_model.py` — генератор модели, если нужно перестроить GLB.

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

Это первая программно собранная реконструкция по одному референсу: скрытые стороны и мелкие формы упрощены. Надписи, группы этажей и интерактивная структура подготовлены под дальнейшую визуальную доводку.
