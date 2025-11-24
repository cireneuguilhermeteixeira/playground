type DashboardProps = {
  userName: string;
};

export function Dashboard({ userName }: DashboardProps) {
  return <h1>Welcome, {userName}!</h1>;
}