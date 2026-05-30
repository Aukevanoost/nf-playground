import { useMemo, useState } from 'react';
import { Compose } from './components/Compose';
import { Filters } from './components/Filters';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { TodoList } from './components/TodoList';
import type { Filter, Todo } from './types';

export function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([
    { id: 1, text: 'Try a React micro frontend', done: true },
    { id: 2, text: 'Build a todo app', done: false },
  ]);
  const [filter, setFilter] = useState<Filter>('all');

  const remaining = useMemo(() => todos.filter((t) => !t.done).length, [todos]);
  const visible = useMemo(() => {
    if (filter === 'active') return todos.filter((t) => !t.done);
    if (filter === 'completed') return todos.filter((t) => t.done);
    return todos;
  }, [todos, filter]);

  const addTodo = (text: string) =>
    setTodos((prev) => [...prev, { id: Date.now(), text, done: false }]);

  const toggle = (id: number) =>
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const remove = (id: number) => setTodos((prev) => prev.filter((t) => t.id !== id));

  const clearCompleted = () => setTodos((prev) => prev.filter((t) => !t.done));

  return (
    <main className="app">
      <Header remaining={remaining} />
      <Compose onAdd={addTodo} />
      <Filters value={filter} onChange={setFilter} />
      <TodoList todos={visible} filter={filter} onToggle={toggle} onRemove={remove} />
      <Footer
        total={todos.length}
        hasCompleted={todos.some((t) => t.done)}
        onClearCompleted={clearCompleted}
      />
    </main>
  );
}
