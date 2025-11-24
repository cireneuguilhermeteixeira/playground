import { Dashboard } from "./Dashboard";
import { withAuth } from "../hocs/withAuth";

export const ProtectedDashboard = withAuth(Dashboard);