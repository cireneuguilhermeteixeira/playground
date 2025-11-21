import type { User } from "./services/user.service";

type UsersViewProps = {
  users: User[];
  loading: boolean;
  error: string | null;
  onReload: () => void;
};

export function PresentationalComponent({
  users,
  loading,
  error,
  onReload,
}: UsersViewProps) {
  if (loading) return <p>Loading users...</p>;

  if (error) {
    return (
      <div>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={onReload}>Try Again</button>
      </div>
    );
  }

  return (
    <div>
      <h2>List of users</h2>

      <ul>
        {users.map(user => (
          <li key={user.id}>
            <strong>{user.name}</strong> — {user.email}
          </li>
        ))}
      </ul>
    </div>
  );
}