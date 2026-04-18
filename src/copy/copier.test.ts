import { copyProfile } from './copier';
import * as manager from '../profiles/manager';

jest.mock('../profiles/manager');

const mockGet = manager.getProfile as jest.Mock;
const mockAdd = manager.addProfile as jest.Mock;

const fakeProfile = { name: 'dev', ports: { web: 3000 } };

beforeEach(() => jest.clearAllMocks());

test('copies a profile successfully', async () => {
  mockGet.mockResolvedValueOnce(fakeProfile).mockResolvedValueOnce(null);
  mockAdd.mockResolvedValue(undefined);

  const result = await copyProfile('dev', 'dev-copy');
  expect(result.success).toBe(true);
  expect(mockAdd).toHaveBeenCalledWith({ name: 'dev-copy', ports: { web: 3000 } }, undefined);
});

test('fails when source not found', async () => {
  mockGet.mockResolvedValueOnce(null);
  const result = await copyProfile('missing', 'dest');
  expect(result.success).toBe(false);
  expect(result.message).toMatch(/not found/);
});

test('fails when destination already exists', async () => {
  mockGet.mockResolvedValueOnce(fakeProfile).mockResolvedValueOnce(fakeProfile);
  const result = await copyProfile('dev', 'staging');
  expect(result.success).toBe(false);
  expect(result.message).toMatch(/already exists/);
});
