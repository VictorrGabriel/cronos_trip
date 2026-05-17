import type { User } from "@prisma/client";

export const makeUserRecord = (overrides: Partial<User> = {}): User => ({
  id: 1n,
  publicId: "john-doe-1234567890",
  name: "John Doe",
  email: "john.doe@example.com",
  passwordHash: "hashed-password",
  createdAt: new Date("2026-05-14T00:00:00.000Z"),
  ...overrides,
});