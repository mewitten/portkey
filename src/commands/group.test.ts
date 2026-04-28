import { Command } from 'commander';
import { registerGroupCommands } from './group';
import * as grouper from '../group/grouper';

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerGroupCommands(program);
  return program;
}

describe('group command', () => {
  afterEach(() => jest.restoreAllMocks());

  it('group list shows groups', async () => {
    jest.spyOn(grouper, 'listGroups').mockResolvedValue([
      { name: 'backend', profiles: ['api', 'db'] },
      { name: 'frontend', profiles: ['web'] },
    ]);
    const logs: string[] = [];
    jest.spyOn(console, 'log').mockImplementation((m) => logs.push(m));
    const program = makeProgram();
    await program.parseAsync(['node', 'portkey', 'group', 'list']);
    expect(logs.some((l) => l.includes('backend'))).toBe(true);
    expect(logs.some((l) => l.includes('frontend'))).toBe(true);
  });

  it('group add creates a group', async () => {
    const addSpy = jest.spyOn(grouper, 'addGroup').mockResolvedValue(undefined);
    const program = makeProgram();
    await program.parseAsync(['node', 'portkey', 'group', 'add', 'infra']);
    expect(addSpy).toHaveBeenCalledWith(expect.anything(), 'infra');
  });

  it('group remove deletes a group', async () => {
    const removeSpy = jest.spyOn(grouper, 'removeGroup').mockResolvedValue(undefined);
    const program = makeProgram();
    await program.parseAsync(['node', 'portkey', 'group', 'remove', 'infra']);
    expect(removeSpy).toHaveBeenCalledWith(expect.anything(), 'infra');
  });

  it('group assign adds profile to group', async () => {
    const assignSpy = jest.spyOn(grouper, 'assignToGroup').mockResolvedValue(undefined);
    const program = makeProgram();
    await program.parseAsync(['node', 'portkey', 'group', 'assign', 'backend', 'api']);
    expect(assignSpy).toHaveBeenCalledWith(expect.anything(), 'backend', 'api');
  });

  it('group unassign removes profile from group', async () => {
    const unassignSpy = jest.spyOn(grouper, 'unassignFromGroup').mockResolvedValue(undefined);
    const program = makeProgram();
    await program.parseAsync(['node', 'portkey', 'group', 'unassign', 'backend', 'api']);
    expect(unassignSpy).toHaveBeenCalledWith(expect.anything(), 'backend', 'api');
  });

  it('group show displays group members', async () => {
    jest.spyOn(grouper, 'getGroup').mockResolvedValue({ name: 'backend', profiles: ['api', 'db'] });
    const logs: string[] = [];
    jest.spyOn(console, 'log').mockImplementation((m) => logs.push(m));
    const program = makeProgram();
    await program.parseAsync(['node', 'portkey', 'group', 'show', 'backend']);
    expect(logs.some((l) => l.includes('api'))).toBe(true);
    expect(logs.some((l) => l.includes('db'))).toBe(true);
  });
});
