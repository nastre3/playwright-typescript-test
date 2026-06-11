export const loginTestCases = [
    {
        id: 1,
        username: 'valid-user',
        password: 'password123',
        expected: 'success',
        description: 'Valid credentials'
    },
    {
        id: 2,
        username: 'invalid-user',
        password: 'wrong-password',
        expected: 'error',
        description: 'Invalid password'
    },
    {
        id: 3,
        username: '',
        password: 'password123',
        expected: 'error',
        description: 'Empty username'
    }
];
