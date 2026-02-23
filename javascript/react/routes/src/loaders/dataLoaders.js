export const userLoader = ({ params }) => {
  return {
    userId: params.userId,
    loadedAt: new Date().toISOString(),
  };
};

export const searchLoader = ({ request }) => {
  const url = new URL(request.url);
  return { query: url.searchParams.get('q') ?? '' };
};
