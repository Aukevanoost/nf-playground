import type { Filter, Todo } from '../types';
import { TodoItem } from './TodoItem';

type Props = {
  todos: Todo[];
  filter: Filter;
  onToggle: (id: number) => void;
  onRemove: (id: number) => void;
};

export function TodoList({ todos, filter, onToggle, onRemove }: Props) {
  if (todos.length === 0) {
    return (
      <ul className="list">
        <li className="empty">
          {filter === 'completed' ? 'Nothing completed yet.' : 'Nothing here. Add a todo above.'}
        </li>
      </ul>
    );
  }

  return (
    <ul className="list">
      {todos.map((t) => (
        <TodoItem key={t.id} todo={t} onToggle={onToggle} onRemove={onRemove} />
      ))}
    </ul>
  );
}
