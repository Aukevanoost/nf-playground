import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { TodoStore } from './todo-store';
import { TODOS_STORAGE_KEY, Todo } from './todo.model';

describe('TodoStore', () => {
  let store: TodoStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    store = TestBed.inject(TodoStore);
  });

  it('seeds with deterministic todos', () => {
    expect(store.total()).toBe(4);
    expect(store.completedCount()).toBe(2);
    expect(store.activeCount()).toBe(2);
  });

  it('adds a trimmed todo and ignores blank input', () => {
    store.add('  Write tests  ');
    expect(store.total()).toBe(5);
    expect(store.todos().at(-1)).toMatchObject({ title: 'Write tests', completed: false });

    store.add('   ');
    expect(store.total()).toBe(5);
  });

  it('generates unique ids for added todos', () => {
    store.add('a');
    store.add('b');
    const ids = store.todos().map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('toggles completion', () => {
    const target = store.todos()[2];
    expect(target.completed).toBe(false);
    store.toggle(target.id);
    expect(store.find(target.id)?.completed).toBe(true);
  });

  it('updates a title and ignores blank updates', () => {
    const target = store.todos()[0];
    store.updateTitle(target.id, 'Renamed');
    expect(store.find(target.id)?.title).toBe('Renamed');

    store.updateTitle(target.id, '   ');
    expect(store.find(target.id)?.title).toBe('Renamed');
  });

  it('removes a todo', () => {
    const target = store.todos()[0];
    store.remove(target.id);
    expect(store.find(target.id)).toBeUndefined();
    expect(store.total()).toBe(3);
  });

  it('clears completed todos', () => {
    store.clearCompleted();
    expect(store.total()).toBe(2);
    expect(store.completedCount()).toBe(0);
  });

  it('persists changes to localStorage', () => {
    store.add('Persisted');
    TestBed.inject(ApplicationRef).tick();

    const raw = localStorage.getItem(TODOS_STORAGE_KEY);
    expect(raw).toBeTruthy();
    const parsed = JSON.parse(raw as string) as Todo[];
    expect(parsed.some((t) => t.title === 'Persisted')).toBe(true);
  });
});
