/**
 * Transactional email abstraction — swap `sendEmail` implementation
 * for Resend, Postmark, SendGrid, etc. (see README).
 */
export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
  tags?: string[];
};

export async function sendEmail(payload: EmailPayload): Promise<{ ok: boolean; id?: string }> {
  if (process.env.NODE_ENV === "development") {
    console.info("[email:placeholder]", payload.subject, "→", payload.to);
  }
  // PLACEHOLDER: wire to your provider
  return { ok: true, id: "placeholder" };
}

export const EmailTemplates = {
  welcome: (name: string) => ({
    subject: "Welcome to Golf Rewards Charity",
    html: `<p>Hi ${escapeHtml(name)},</p><p>Thanks for joining. Your membership fuels monthly draws and real-world impact.</p>`,
  }),
  subscriptionActive: (name: string) => ({
    subject: "Subscription confirmed",
    html: `<p>Hi ${escapeHtml(name)},</p><p>Your subscription is active. You can manage billing anytime from your dashboard.</p>`,
  }),
  paymentFailed: (name: string) => ({
    subject: "Payment issue on your account",
    html: `<p>Hi ${escapeHtml(name)},</p><p>We could not process your latest invoice. Please update your payment method to stay eligible for draws.</p>`,
  }),
  drawResult: (name: string, drawTitle: string) => ({
    subject: `Draw published: ${drawTitle}`,
    html: `<p>Hi ${escapeHtml(name)},</p><p>Results for <strong>${escapeHtml(drawTitle)}</strong> are now live in your dashboard.</p>`,
  }),
  winnerAlert: (name: string, amount: string) => ({
    subject: "You matched — next steps inside",
    html: `<p>Hi ${escapeHtml(name)},</p><p>Great news — you have a winning match this month (${escapeHtml(amount)}). Upload your proof in the app to start verification.</p>`,
  }),
  proofApproved: (name: string) => ({
    subject: "Winner proof approved",
    html: `<p>Hi ${escapeHtml(name)},</p><p>Your proof was approved. Our team will mark payout once funds are released.</p>`,
  }),
};

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
