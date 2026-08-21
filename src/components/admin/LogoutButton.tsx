"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }
  return (
    <button onClick={handleLogout} className="text-white/70 hover:text-white text-sm w-full text-left">
      🚪 Logout
    </button>
  );
}
