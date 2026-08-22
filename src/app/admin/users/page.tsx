import { listUsers } from "@/lib/users";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const users = await listUsers();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">👥 Customers</h1>

      <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-2 px-4">ID</th>
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Phone</th>
              <th className="py-2 px-4">Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-100">
                <td className="py-2 px-4">#{u.id}</td>
                <td className="py-2 px-4">{u.name}</td>
                <td className="py-2 px-4">{u.phone}</td>
                <td className="py-2 px-4 text-gray-500">{u.created_at}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 text-center text-gray-400">কোনো কাস্টমার নেই</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
