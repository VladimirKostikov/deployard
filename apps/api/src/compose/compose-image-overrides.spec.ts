import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveComposeImageOverrides } from './compose-image-overrides';

describe('compose-image-overrides', () => {
  const todoCompose = resolve(__dirname, '../../../../demo/todo-board/compose.yml');

  it('fills project scoped local tags for all build services', () => {
    const overrides = resolveComposeImageOverrides(todoCompose, 'todo-board', {});

    expect(overrides).toEqual({
      'todo-api': 'todo-board-todo-api:local',
      'todo-web': 'todo-board-todo-web:local',
    });
  });

  it('keeps explicit overrides and fills missing build services', () => {
    const overrides = resolveComposeImageOverrides(todoCompose, 'todo-board', {
      'todo-api': 'todo-board-todo-api:local',
    });

    expect(overrides['todo-web']).toBe('todo-board-todo-web:local');
  });

  it('scopes weather-station build services to project name', () => {
    const weatherCompose = resolve(__dirname, '../../../../demo/weather-station/compose.yml');
    const overrides = resolveComposeImageOverrides(weatherCompose, 'weather-station', {});

    expect(overrides).toEqual({
      'weather-api': 'weather-station-weather-api:local',
      'weather-web': 'weather-station-weather-web:local',
    });
  });
});
