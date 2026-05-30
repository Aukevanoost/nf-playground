export const recommendationsStyles = `
.e_Recommendations {
  padding: 1rem;
  margin: 0 -1rem 3rem;
}

.e_Recommendations_list {
  position: relative;
  display: grid;
  gap: 40px;
  padding: 0;
  list-style-type: none;
}

@media (max-width: 499px) {
  .e_Recommendations_list { grid-template-columns: 1fr 1fr; }
}
@media (min-width: 500px) and (max-width: 999px) {
  .e_Recommendations_list { grid-template-columns: 1fr 1fr 1fr; }
}
@media (min-width: 1000px) {
  .e_Recommendations_list { grid-template-columns: repeat(4, 1fr); }
}
`;
