// Manual Jest mock for '@/db' to provide a stable, chainable `db.select()` mock
const mockLimit = jest.fn().mockResolvedValue([]);
const mockWhere = jest.fn().mockReturnValue({ limit: mockLimit });
const mockInnerJoin = jest.fn().mockReturnValue({ where: mockWhere });
const mockFrom = jest.fn().mockReturnValue({ innerJoin: mockInnerJoin });

export const db = {
  select: jest.fn().mockReturnValue({ from: mockFrom }),
  // You can add other methods used in tests if necessary
};

export default db;
