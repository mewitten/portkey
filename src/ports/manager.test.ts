import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addPort, removePort, listPorts, getPort } from './manager';
import * as store from '../config/store';

vi.mock('../config/store');

const mockLoad = vi.mocked(store.loadConfig);
const mockSave = vi.mocked(store.saveConfig);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('listPorts', () => {
  it('returns empty array when no ports configured', async () => {
    mockLoad.mockResolvedValue({});
    const result = await listPorts();
    expect(result).toEqual([]);
  });

  it('returns existing ports', async () => {
    const ports = [{ name: 'api', port: 3000 }];
    mockLoad.mockResolvedValue({ ports });
    expect(await listPorts()).toEqual(ports);
  });
});

describe('addPort', () => {
  it('adds a new port entry', async () => {
    mockLoad.mockResolvedValue({ ports: [] });
    mockSave.mockResolvedValue(undefined);
    await addPort({ name: 'web', port: 8080 });
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({
        ports: expect.arrayContaining([{ name: 'web', port: 8080 }]),
      })
    );
  });

  it('throws on duplicate name', async () => {
    mockLoad.mockResolvedValue({ ports: [{ name: 'web', port: 8080 }] });
    await expect(addPort({ name: 'web', port: 9090 })).rejects.toThrow('Conflict');
  });

  it('throws on duplicate port number', async () => {
    mockLoad.mockResolvedValue({ ports: [{ name: 'web', port: 8080 }] });
    await expect(addPort({ name: 'other', port: 8080 })).rejects.toThrow('Conflict');
  });
});

describe('removePort', () => {
  it('removes an existing port', async () => {
    mockLoad.mockResolvedValue({ ports: [{ name: 'api', port: 3000 }] });
    mockSave.mockResolvedValue(undefined);
    await removePort('api');
    expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ ports: [] }));
  });

  it('throws when port not found', async () => {
    mockLoad.mockResolvedValue({ ports: [] });
    await expect(removePort('missing')).rejects.toThrow('not found');
  });
});

describe('getPort', () => {
  it('returns the matching port entry', async () => {
    const entry = { name: 'db', port: 5432, description: 'Postgres' };
    mockLoad.mockResolvedValue({ ports: [entry] });
    expect(await getPort('db')).toEqual(entry);
  });

  it('returns undefined for unknown name', async () => {
    mockLoad.mockResolvedValue({ ports: [] });
    expect(await getPort('nope')).toBeUndefined();
  });
});
