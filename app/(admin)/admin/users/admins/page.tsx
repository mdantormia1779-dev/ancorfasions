import { UsersTable, UserData } from "@/features/admin/components/UsersTable";

export const metadata = {
  title: "Admin Users | Anchor Fashion",
};

const adminUsers: UserData[] = [
  {
    id: "1",
    name: "Eleanor Vance",
    email: "eleanor@anchorfashion.com",
    role: "Super Admin",
    status: "Active",
    lastActive: "2 mins ago",
  },
  {
    id: "2",
    name: "Thomas Wayne",
    email: "thomas@anchorfashion.com",
    role: "System Admin",
    status: "Active",
    lastActive: "1 hr ago",
  },
];

export default function AdminUsersPage() {
  return (
    <div className="p-8 pt-6">
      <UsersTable
        title="Admin Users"
        description="Manage users with full or restricted system administrative privileges."
        users={adminUsers}
      />
    </div>
  );
}
