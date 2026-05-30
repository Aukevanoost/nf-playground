import type { Todo } from '../types';

type Props = {
  todo: Todo;
  onToggle: (id: number) => void;
  onRemove: (id: number) => void;
};

export function TodoItem({ todo, onToggle, onRemove }: Props) {
  return (
    <li className={`item ${todo.done ? 'item-done' : ''}`}>
      <label className="check">
        <input
          type="checkbox"
          checked={todo.done}
          onChange={() => onToggle(todo.id)}
          aria-label={`Mark ${todo.text} as ${todo.done ? 'active' : 'done'}`}
        />
        <span className="box" aria-hidden="true" />
        <span className="text">{todo.text}</span>
      </label>
      <button
        className="remove"
        onClick={() => onRemove(todo.id)}
        aria-label={`Delete ${todo.text}`}
      >
        ×
      </button>
    </li>
  );
}
