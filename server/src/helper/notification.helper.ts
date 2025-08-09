export const IO = {
  MESSAGES: {
    ACCOUNT_CREATED: () => "Your account has been created successfully.",
    ACCOUNT_BANNED: (reason: string) => `Your account has been banned. Reason: ${reason}`,
    COINS_ADDED: (amount: number) => `${amount} glow coins have been added to your account.`,
    COINS_DEDUCTED: (amount: number) => `${amount} glow coins have been deducted from your account.`,
    FOLLOWED_USER: (followerName: string) => `${followerName} started following you.`,
    PAYMENT_RECORDED: (amount: number, accountName: string) =>
      `New payment recorded: ₹${amount} for account ${accountName}.`,
    PAYMENT_STATUS_UPDATED: (status: string, accountName: string) =>
      `Payment status changed to ${status} for account ${accountName}.`,
    ACTIVITY_LOGGED: (accountName: string) =>
      `New activity logged: for account ${accountName}.`,
    CUSTOM: (text: string) => text,
  },
};