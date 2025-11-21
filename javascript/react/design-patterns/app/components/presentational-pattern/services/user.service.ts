export type User = {
  id: number;
  name: string;
  email: string;
};

export function fetchUsers(): Promise<User[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve([
        { id: 1, name: "Ana", email: "ana@email.com" },
        { id: 2, name: "João", email: "joao@email.com" },
        { id: 3, name: "Maria", email: "maria@email.com" },
      ]);
    }, 1500);
  });
}