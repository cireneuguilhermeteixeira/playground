export const userLoader = ({ params }) => {
  return {
    userId: params.userId,
    loadedAt: new Date().toISOString(),
  };
};

export const searchLoader = ({ search }) => {
  return { query: search.q ?? '' };
};
