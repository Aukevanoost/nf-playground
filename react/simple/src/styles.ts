export const styles = `
  :host {
    display: block;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    color: #1f2330;
    --accent: #5b6cff;
    --accent-hover: #4656e6;
    --bg: #f5f6fb;
    --surface: #ffffff;
    --border: #e6e8f0;
    --muted: #7a8095;
    --danger: #ef4444;
  }

  * { box-sizing: border-box; }

  .app {
    max-width: 32rem;
    margin: 2.5rem auto;
    padding: 2rem;
    background: var(--surface);
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(18, 22, 40, 0.06), 0 2px 6px rgba(18, 22, 40, 0.04);
  }

  .header h1 {
    margin: 0;
    font-size: 1.75rem;
    letter-spacing: -0.02em;
  }

  .subtitle {
    margin: 0.25rem 0 1.5rem;
    color: var(--muted);
    font-size: 0.9rem;
  }

  .compose {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .input {
    flex: 1;
    padding: 0.75rem 0.9rem;
    font-size: 1rem;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--bg);
    outline: none;
    transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
    color: inherit;
  }
  .input:focus {
    border-color: var(--accent);
    background: #fff;
    box-shadow: 0 0 0 3px rgba(91, 108, 255, 0.15);
  }

  .btn {
    padding: 0.75rem 1.1rem;
    font-size: 0.95rem;
    font-weight: 600;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.15s, transform 0.05s;
  }
  .btn:active { transform: translateY(1px); }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-primary {
    background: var(--accent);
    color: #fff;
  }
  .btn-primary:not(:disabled):hover { background: var(--accent-hover); }

  .filters {
    display: flex;
    gap: 0.35rem;
    margin-bottom: 1rem;
  }

  .chip {
    padding: 0.35rem 0.75rem;
    font-size: 0.85rem;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.15s;
  }
  .chip:hover { color: #1f2330; border-color: #cdd1de; }
  .chip-active {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
  }
  .chip-active:hover { color: #fff; border-color: var(--accent); }

  .list {
    list-style: none;
    padding: 0;
    margin: 0 0 1rem;
    border-top: 1px solid var(--border);
  }

  .empty {
    padding: 2rem 0;
    text-align: center;
    color: var(--muted);
    font-size: 0.9rem;
  }

  .item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid var(--border);
  }

  .check {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    cursor: pointer;
    user-select: none;
  }
  .check input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .box {
    width: 20px;
    height: 20px;
    border: 2px solid #c9cdda;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
    flex-shrink: 0;
  }
  .check input:focus-visible + .box {
    box-shadow: 0 0 0 3px rgba(91, 108, 255, 0.25);
  }
  .item-done .box {
    background: var(--accent);
    border-color: var(--accent);
  }
  .item-done .box::after {
    content: '';
    width: 6px;
    height: 10px;
    border: solid #fff;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg) translate(-1px, -1px);
  }

  .text {
    font-size: 1rem;
    transition: color 0.15s;
  }
  .item-done .text {
    color: var(--muted);
    text-decoration: line-through;
  }

  .remove {
    width: 28px;
    height: 28px;
    border: none;
    background: transparent;
    color: var(--muted);
    font-size: 1.25rem;
    line-height: 1;
    border-radius: 6px;
    cursor: pointer;
    opacity: 0;
    transition: all 0.15s;
  }
  .item:hover .remove,
  .remove:focus-visible { opacity: 1; }
  .remove:hover { background: #fff0f0; color: var(--danger); }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
    color: var(--muted);
  }

  .btn-link {
    background: none;
    border: none;
    color: var(--muted);
    font-size: 0.85rem;
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
  }
  .btn-link:not(:disabled):hover { color: var(--danger); background: #fff0f0; }
  .btn-link:disabled { opacity: 0.4; cursor: not-allowed; }
`;
