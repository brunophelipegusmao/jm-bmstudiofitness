// Manual mock aligned with moduleNameMapper '^@/(.*)$' -> '<rootDir>/src/$1'
// This ensures jest.mock('@/db') loads this mock.
const mockLimit = jest.fn().mockResolvedValue([]);
const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
const mockInnerJoin = jest.fn().mockReturnValue({ where: mockWhere });
const mockFrom = jest.fn().mockReturnValue({ innerJoin: mockInnerJoin });

export const db = {
  select: jest.fn().mockReturnValue({ from: mockFrom }),
};

export default db;
