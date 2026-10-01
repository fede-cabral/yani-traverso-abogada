import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    // Las pruebas de autorización golpean una base real y comparten estado
    // (los mismos usuarios y el mismo producto de prueba). En paralelo se
    // pisarían entre sí y darían falsos verdes, que es peor que un rojo.
    fileParallelism: false,
    sequence: { concurrent: false },
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});
