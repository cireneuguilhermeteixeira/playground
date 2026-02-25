export const userLoader = ({ params }: { params: { userId: string } }) => {
  return {
    userId: params.userId,
    loadedAt: new Date().toISOString(),
  };
};

export const searchLoader = ({ search }: { search: { q?: string } }) => {
  return { query: search.q ?? '' };
};
