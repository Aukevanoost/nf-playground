type Props = {
  remaining: number;
};

export function Header({ remaining }: Props) {
  return (
    <header className="header">
      <h1>Todos</h1>
      <p className="subtitle">
        {remaining === 0 ? 'All done — nice work.' : `${remaining} left to do`}
      </p>
    </header>
  );
}
