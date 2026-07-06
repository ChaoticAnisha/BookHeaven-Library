"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export function useWishlist() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchWishlist = useCallback(async () => {
    if (!user) {
      setWishlist(new Set());
      setLoading(false);
      return;
    }
    try {
      const res = await api.get("/users/wishlist");
      if (res.data.success) {
        const ids = (res.data.data || []).map((b: any) => (typeof b === "string" ? b : b._id));
        setWishlist(new Set(ids));
      }
    } catch (err) {
      console.error("Failed to load wishlist", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const isWishlisted = useCallback((bookId: string) => wishlist.has(bookId), [wishlist]);

  const toggleWishlist = useCallback(
    async (bookId: string) => {
      const wasWishlisted = wishlist.has(bookId);
      setWishlist((prev) => {
        const next = new Set(prev);
        if (wasWishlisted) next.delete(bookId);
        else next.add(bookId);
        return next;
      });
      try {
        if (wasWishlisted) {
          await api.delete(`/users/wishlist/${bookId}`);
          toast({ title: "Removed from Wishlist" });
        } else {
          await api.post(`/users/wishlist/${bookId}`);
          toast({ title: "Added to Wishlist", className: "bg-[#3B4FE8] dark:bg-indigo-500 text-white border-none" });
        }
      } catch (err) {
        // Revert optimistic update on failure
        setWishlist((prev) => {
          const next = new Set(prev);
          if (wasWishlisted) next.add(bookId);
          else next.delete(bookId);
          return next;
        });
        toast({
          title: "Couldn't update wishlist",
          description: "Please try again.",
          variant: "destructive",
        });
      }
    },
    [wishlist, toast]
  );

  return { wishlist, isWishlisted, toggleWishlist, loading, refetch: fetchWishlist };
}
