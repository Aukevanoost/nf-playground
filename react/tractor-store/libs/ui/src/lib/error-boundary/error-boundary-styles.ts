export const errorBoundaryStyles = `
.c_ErrorBoundary {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  margin: 1rem 0;
  padding: 1rem 1.25rem;
  border: 1px solid rgba(255, 90, 85, 0.4);
  border-radius: 8px;
  background: rgba(255, 90, 85, 0.06);
  color: #b3211c;
  font-size: 0.9rem;
  line-height: 1.4;
}

.c_ErrorBoundary__title {
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.c_ErrorBoundary__detail {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.8rem;
  color: #6a1614;
  word-break: break-word;
}
`;
