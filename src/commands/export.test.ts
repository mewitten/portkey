import { Command } from 'commander';
import { registerExportCommands } from './export';
import * as exporter from '../export/exporter';

jest.mock('../export/exporter');

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerExportCommands(program);
  return program;
}

beforeEach(() => {
  jest.clearAllMocks();
  (exporter.exportConfig as jest.Mock).mockReturnValue('MOCK_OUTPUT');
});

describe('export command', () => {
  it('calls exportConfig with default json format', () => {
    const program = makeProgram();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    program.parse(['export'], { from: 'user' });
    expect(exporter.exportConfig).toHaveBeenCalledWith(
      expect.objectContaining({ format: 'json' })
    );
    consoleSpy.mockRestore();
  });

  it('passes profile option to exportConfig', () => {
    const program = makeProgram();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    program.parse(['export', '--profile', 'staging'], { from: 'user' });
    expect(exporter.exportConfig).toHaveBeenCalledWith(
      expect.objectContaining({ profile: 'staging' })
    );
    consoleSpy.mockRestore();
  });

  it('passes output path to exportConfig', () => {
    const program = makeProgram();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    program.parse(['export', '--output', './out.env', '--format', 'env'], { from: 'user' });
    expect(exporter.exportConfig).toHaveBeenCalledWith(
      expect.objectContaining({ format: 'env', outputPath: './out.env' })
    );
    consoleSpy.mockRestore();
  });

  it('prints error and exits on invalid format', () => {
    const program = makeProgram();
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    expect(() =>
      program.parse(['export', '--format', 'yaml'], { from: 'user' })
    ).toThrow('exit');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid format'));
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('handles exportConfig errors gracefully', () => {
    (exporter.exportConfig as jest.Mock).mockImplementation(() => { throw new Error('Profile not found'); });
    const program = makeProgram();
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    expect(() => program.parse(['export'], { from: 'user' })).toThrow('exit');
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining('Profile not found'));
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
