// src/users/Users.container.tsx
import { useEffect, useState } from "react";
import { PresentationalComponent } from "./PresentationalComponent";
import { fetchUsers, type User } from "./services/user.service";

export function UsersContainer() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadUsers() {
    try {
      setLoading(true);
      setError(null);

      const data = await fetchUsers();
      setUsers(data);
    } catch (err) {
      setError("Error loading data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <PresentationalComponent
      users={users}
      loading={loading}
      error={error}
      onReload={loadUsers}
    />
  );
}
