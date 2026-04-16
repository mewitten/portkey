import { resolveTemplate, extractTemplateVars, TemplateVar } from './template';
import * as store from '../config/store';

jest.mock('../config/store');

const mockConfig = {
  ports: { web: 3000, api: 4000 },
  profiles: {
    dev: { ports: { web: 3001, api: 4001 } }
  }
};

describe('resolveTemplate', () => {
  it('replaces single variable', () => {
    const vars: TemplateVar[] = [{ key: 'PORT_WEB', value: 3000 }];
    expect(resolveTemplate('http://localhost:{{PORT_WEB}}', vars)).toBe('http://localhost:3000');
  });

  it('replaces multiple variables', () => {
    const vars: TemplateVar[] = [
      { key: 'PORT_WEB', value: 3000 },
      { key: 'PORT_API', value: 4000 }
    ];
    const result = resolveTemplate('web={{PORT_WEB}} api={{PORT_API}}', vars);
    expect(result).toBe('web=3000 api=4000');
  });

  it('handles spaces inside braces', () => {
    const vars: TemplateVar[] = [{ key: 'PORT_WEB', value: 3000 }];
    expect(resolveTemplate('{{ PORT_WEB }}', vars)).toBe('3000');
  });

  it('leaves unknown vars unchanged', () => {
    expect(resolveTemplate('{{UNKNOWN}}', [])).toBe('{{UNKNOWN}}');
  });
});

describe('extractTemplateVars', () => {
  it('extracts vars from default ports', () => {
    const vars = extractTemplateVars(mockConfig as any);
    expect(vars).toContainEqual({ key: 'PORT_WEB', value: 3000 });
    expect(vars).toContainEqual({ key: 'web', value: 3000 });
  });

  it('extracts vars from profile ports', () => {
    const vars = extractTemplateVars(mockConfig as any, 'dev');
    expect(vars).toContainEqual({ key: 'PORT_WEB', value: 3001 });
    expect(vars).toContainEqual({ key: 'PROFILE', value: 'dev' });
  });

  it('falls back to default ports if profile has none', () => {
    const config = { ports: { web: 3000 }, profiles: { staging: {} } };
    const vars = extractTemplateVars(config as any, 'staging');
    expect(vars).toContainEqual({ key: 'PORT_WEB', value: 3000 });
  });
});
