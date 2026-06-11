import { test, expect } from '@playwright/test';

test('get users API validation', async ({ request }) => {
    // GET-запрос к API
    const response = await request.get('/api/users');

    // Валидация статуса
    expect(response.status()).toBe(200);

    // Парсинг JSON
    const users = await response.json();

    // Валидация структуры данных
    expect(users).toHaveLength(3);
    expect(users[0]).toHaveProperty('id');
    expect(users[0]).toHaveProperty('name');
    expect(users[0]).toHaveProperty('email');

    // Валидация типов
    expect(typeof users[0].id).toBe('number');
    expect(typeof users[0].name).toBe('string');
    expect(typeof users[0].email).toBe('string');

    // Валидация конкретных значений
    expect(users[0].name).toBe('John Doe');
});
