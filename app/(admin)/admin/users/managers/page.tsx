import { UsersTable, UserData } from "@/features/admin/components/UsersTable";

export const metadata = {
  title: "Managers | Anchor Fashion",
};

const managerUsers: UserData[] = [
  {
    id: "3",
    name: "Marcus Sterling",
    email: "marcus@anchorfashion.com",
    role: "Finance Manager",
    status: "Active",
    lastActive: "1 hr ago",
  },
  {
    id: "4",
    name: "Sophia Chen",
    email: "sophia@anchorfashion.com",
    role: "Marketing Manager",
    status: "Active",
    lastActive: "3 hrs ago",
  },
];

export default function ManagersPage() {
  return (
    <div className="p-8 pt-6">
      <UsersTable
        title="Managers"
        description="Manage department leaders and operations managers."
        users={managerUsers}
      />
    </div>
  );
}
