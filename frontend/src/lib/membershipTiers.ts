// Mirrors backend/src/config/config.ts `rental.tiers`. Keep in sync — there is
// no public endpoint that exposes this config, so the client enforces the same
// limits the server enforces in RentalService.rentBook.
export const MEMBERSHIP_TIERS: Record<string, { maxBooks: number; maxDays: number }> = {
  Basic: { maxBooks: 3, maxDays: 14 },
  Student: { maxBooks: 5, maxDays: 21 },
  Premium: { maxBooks: 10, maxDays: 30 },
};

export function getTierMaxDays(membership?: string): number {
  return MEMBERSHIP_TIERS[membership || "Basic"]?.maxDays ?? MEMBERSHIP_TIERS.Basic.maxDays;
}
