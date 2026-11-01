export function formatKES(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return 'KSh 0';
  return `KSh ${Math.round(amount).toLocaleString('en-KE')}`;
}

export function formatKESCompact(amount: number): string {
  if (amount === undefined || amount === null || isNaN(amount)) return 'KSh 0';
  const abs = Math.abs(amount);
  if (abs >= 1_000_000_000) {
    return `KSh ${(amount / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  }
  if (abs >= 1_000_000) {
    return `KSh ${(amount / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (abs >= 1_000) {
    return `KSh ${(amount / 1_000).toFixed(0)}K`;
  }
  return `KSh ${amount.toLocaleString('en-KE')}`;
}

export function formatPhoneNumberKE(phone?: string): string {
  if (!phone) return '+254 700 000 000';
  return phone;
}
