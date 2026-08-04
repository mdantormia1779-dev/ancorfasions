import { UsersTable, UserData } from "@/features/admin/components/UsersTable";

export const metadata = {
  title: "Staff | Anchor Fashion",
};

const staffUsers: UserData[] = [
  {
    id: "5",
    name: "David Miller",
    email: "david@anchorfashion.com",
    role: "Support Agent",
    status: "Inactive",
    lastActive: "5 days ago",
  },
  {
    id: "6",
    name: "Emma Stone",
    email: "emma@anchorfashion.com",
    role: "Content Creator",
    status: "Active",
    lastActive: "2 hrs ago",
  },
];

export default function StaffPage() {
  return (
    <div className="p-8 pt-6">
      <UsersTable
        title="Staff"
        description="Manage general staff, support agents, and content creators."
        users={staffUsers}
      />
    </div>
  );
}
