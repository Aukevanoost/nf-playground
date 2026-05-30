type Props = {
  total: number;
  hasCompleted: boolean;
  onClearCompleted: () => void;
};

export function Footer({ total, hasCompleted, onClearCompleted }: Props) {
  return (
    <footer className="footer">
      <span>{total} total</span>
      <button className="btn-link" onClick={onClearCompleted} disabled={!hasCompleted}>
        Clear completed
      </button>
    </footer>
  );
}
