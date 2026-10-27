"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ShoppingBag, Check } from "lucide-react";
import { useAppStore } from "@/store";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";
import type { Product } from "@/types";

interface PublicAddToCartButtonProps {
  product: Product;
  sellerId?: string;
  price?: number;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "gold" | "outline" | "secondary";
}

export function PublicAddToCartButton({
  product,
  sellerId,
  price,
  className = "",
  size = "md",
  variant = "gold",
}: PublicAddToCartButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { currentUser, currentRole, addToCart, setCartDrawerOpen } = useAppStore();
  const [isAdding, setIsAdding] = useState(false);

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // If no customer session exists, route to login with return URL
    if (!currentUser || currentRole !== "Customer") {
      toast.info("Please sign in to add formulations to your luxury bag", {
        description: "Redirecting to authentication portal...",
      });
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Customer session exists: add to unified cart
    setIsAdding(true);
    addToCart(product, 1, sellerId, price);

    setTimeout(() => {
      setIsAdding(false);
      toast.success(`${product.name} added to your bag`, {
        action: {
          label: "View Bag",
          onClick: () => setCartDrawerOpen(true),
        },
      });
    }, 350);
  };

  return (
    <Button
      type="button"
      onClick={handleAction}
      variant={variant as any}
      size={size as any}
      className={`shadow-gold-sm hover:shadow-gold-md font-medium ${className}`}
    >
      {isAdding ? (
        <span className="flex items-center gap-1.5">
          <Check className="w-4 h-4 animate-bounce" /> Added to Bag
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          <ShoppingBag className="w-4 h-4" /> Add to Cart
        </span>
      )}
    </Button>
  );
}
