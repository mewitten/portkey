import { loadConfig } from '../config/store';
import { PortConfig, Profile } from '../config/schema';

export interface SearchResult {
  profile: string;
  key: string;
  port: number;
}

export function searchByPort(port: number): SearchResult[] {
  const config = loadConfig();
  const results: SearchResult[] = [];
  for (const [profileName, profile] of Object.entries(config.profiles || {})) {
    for (const [key, value] of Object.entries(profile.ports || {})) {
      if (value === port) {
        results.push({ profile: profileName, key, port: value });
      }
    }
  }
  return results;
}

export function searchByKey(keyword: string): SearchResult[] {
  const config = loadConfig();
  const results: SearchResult[] = [];
  const lower = keyword.toLowerCase();
  for (const [profileName, profile] of Object.entries(config.profiles || {})) {
    for (const [key, value] of Object.entries(profile.ports || {})) {
      if (key.toLowerCase().includes(lower)) {
        results.push({ profile: profileName, key, port: value });
      }
    }
  }
  return results;
}

export function searchByProfile(profileName: string, keyword?: string): SearchResult[] {
  const config = loadConfig();
  const profile = config.profiles?.[profileName];
  if (!profile) return [];
  return Object.entries(profile.ports || {})
    .filter(([key]) => !keyword || key.toLowerCase().includes(keyword.toLowerCase()))
    .map(([key, port]) => ({ profile: profileName, key, port }));
}
