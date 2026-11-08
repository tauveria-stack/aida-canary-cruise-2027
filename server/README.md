# Railway — тестовий сімейний API

Статус: код підготовлено; Railway ще не розгорнуто, браузерну сторінку ще не підключено.

1. Створити окремий Railway service з GitHub branch audit-fixes-2026-11-06; Root Directory: /server.
2. Додати PostgreSQL; налаштувати DATABASE_URL як Railway reference variable.
3. Задати FAMILY_ACCESS_KEY: випадковий сімейний код щонайменше 24 символи. Не записувати його у GitHub чи публічний JavaScript.
4. Задати ALLOWED_ORIGINS: точні HTTPS origins тестового сайту, через кому.
5. npm start; GET /health має повернути status ok.
6. GET /api/answers та PUT /api/answers/:person вимагають Authorization: Bearer <FAMILY_ACCESS_KEY>.

Обмеження: спільний код дозволяє читати і змінювати відповіді всіх учасників. Це не персональна автентифікація. Перед повноцінним запуском додати захист від одночасного перезапису, резервні копії та UI для введення сімейного коду. Секрет у браузері не зберігати в localStorage. Не називати цей прототип готовим production-сервісом.
