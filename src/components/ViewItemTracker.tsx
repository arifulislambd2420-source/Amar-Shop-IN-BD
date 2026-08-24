"use client";

import { useEffect } from "react";
import { pushToDataLayer } from "@/lib/gtm-client";

export default function ViewItemTracker({ id, name, price }: { id: number; name: string; price: number }) {
  useEffect(() => {
    pushToDataLayer("view_item", {
      ecommerce: {
        currency: "BDT",
        value: price,
        items: [{ item_id: id, item_name: name, price }],
      },
    });
  }, [id, name, price]);
  return null;
}
