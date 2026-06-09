import { Resend } from "resend";

// Sends transactional email via Resend. If RESEND_API_KEY isn't configured,
// falls back to logging the code to the server console so the reset flow is
// fully testable in development without an email provider.
const apiKey = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM ?? "AussieWheels <onboarding@resend.dev>";
const resend = apiKey ? new Resend(apiKey) : null;

export async function sendOtpEmail(to: string, code: string, name?: string) {
  if (!resend) {
    // eslint-disable-next-line no-console
    console.log(
      `\n──────────────────────────────────────────\n[email:dev] Password reset code for ${to}: ${code}\n(Set RESEND_API_KEY + EMAIL_FROM to send real emails)\n──────────────────────────────────────────\n`,
    );
    return { dev: true as const };
  }

  const html = `
  <div style="font-family:Inter,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#1B3A5C">
    <div style="font-size:20px;font-weight:800">Aussie<span style="color:#2E6DA4">Wheels</span></div>
    <h1 style="font-size:20px;margin:24px 0 8px">Reset your password</h1>
    <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 20px">
      Hi${name ? ` ${name}` : ""}, use the code below to reset your AussieWheels password. It expires in 10 minutes.
    </p>
    <div style="font-size:34px;font-weight:800;letter-spacing:8px;background:#F5F7FA;border:1px solid #e2e8f0;border-radius:12px;padding:18px;text-align:center;color:#1B3A5C">
      ${code}
    </div>
    <p style="color:#94a3b8;font-size:12px;line-height:1.6;margin:20px 0 0">
      If you didn't request this, you can safely ignore this email — your password won't change.
    </p>
  </div>`;

  await resend.emails.send({
    from: FROM,
    to,
    subject: "Your AussieWheels password reset code",
    html,
  });
  return { dev: false as const };
}
