module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    verbose: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    roots: ['<rootDir>/src'],
    testMatch: ['**/tests/**/*.test.ts'],
};
