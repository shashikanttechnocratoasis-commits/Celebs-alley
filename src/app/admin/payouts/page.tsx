"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPayoutsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/commerce/commissions");
  }, [router]);

  return (
    <div className="flex h-64 items-center justify-center text-xs text-zinc-500">
      Redirecting to Payout Approval Queue...
    </div>
  );
}
