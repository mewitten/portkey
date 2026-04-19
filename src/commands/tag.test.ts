import { Command } from 'commander';
import { registerTagCommands } from './tag';
import * as tagger from '../tag';

jest.mock('../tag');

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerTagCommands(program);
  return program;
}

beforeEach(() => jest.clearAllMocks());

test('tag add calls addTag', async () => {
  (tagger.addTag as jest.Mock).mockResolvedValue(undefined);
  const spy = jest.spyOn(console, 'log').mockImplementation();
  await makeProgram().parseAsync(['tag', 'add', 'dev', 'frontend'], { from: 'user' });
  expect(tagger.addTag).toHaveBeenCalledWith('dev', 'frontend');
  spy.mockRestore();
});

test('tag remove calls removeTag', async () => {
  (tagger.removeTag as jest.Mock).mockResolvedValue(undefined);
  const spy = jest.spyOn(console, 'log').mockImplementation();
  await makeProgram().parseAsync(['tag', 'remove', 'dev', 'frontend'], { from: 'user' });
  expect(tagger.removeTag).toHaveBeenCalledWith('dev', 'frontend');
  spy.mockRestore();
});

test('tag list calls listTags', async () => {
  (tagger.listTags as jest.Mock).mockResolvedValue(['a', 'b']);
  const spy = jest.spyOn(console, 'log').mockImplementation();
  await makeProgram().parseAsync(['tag', 'list', 'dev'], { from: 'user' });
  expect(tagger.listTags).toHaveBeenCalledWith('dev');
  expect(spy).toHaveBeenCalledWith('a');
  spy.mockRestore();
});

test('tag filter calls listByTag', async () => {
  (tagger.listByTag as jest.Mock).mockResolvedValue(['dev', 'web']);
  const spy = jest.spyOn(console, 'log').mockImplementation();
  await makeProgram().parseAsync(['tag', 'filter', 'frontend'], { from: 'user' });
  expect(tagger.listByTag).toHaveBeenCalledWith('frontend');
  spy.mockRestore();
});

test('tag add prints error on failure', async () => {
  (tagger.addTag as jest.Mock).mockRejectedValue(new Error('fail'));
  const spy = jest.spyOn(console, 'error').mockImplementation();
  const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
  await expect(makeProgram().parseAsync(['tag', 'add', 'dev', 'x'], { from: 'user' })).rejects.toThrow();
  expect(spy).toHaveBeenCalledWith('fail');
  spy.mockRestore();
  mockExit.mockRestore();
});
