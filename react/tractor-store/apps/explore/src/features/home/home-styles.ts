export const homeStyles = `
.e_HomePage {
  max-width: calc(1000px + var(--outer-space) * 2);
  padding: 0 var(--outer-space);
  margin: 3rem auto 0;
}
@media (min-width: 500px) {
  .e_HomePage {
    grid-template-columns: 1fr 1fr;
    display: grid;
    gap: 1rem;
  }
}

.e_HomePage__categoryLink {
  display: block;
  position: relative;
  margin-bottom: 2rem;
  color: inherit;
  text-align: center;
  text-decoration: none;
}

.e_HomePage__categoryLink:hover,
.e_HomePage__categoryLink:focus { text-decoration: underline; }

.e_HomePage__categoryLink img {
  width: 100%;
  aspect-ratio: 1000 / 560;
  margin-bottom: 0.75rem;
}

.e_HomePage__recommendations { grid-column: span 2; }
`;
