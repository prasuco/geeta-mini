import { Resend } from 'resend';
import { welcomeEmail } from '../utils/welcomeEmail';


export async function GET(p) {
  console.log("nice", p)

  const url = new URL(p.request.url);
  const email = url.searchParams.get('email');

  // ✅ Use Astro.env for server-side secrets
  const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    console.log("not", RESEND_API_KEY)
    return new Response(
      JSON.stringify({ success: false, message: "API key missing" }),
      { status: 500 }
    );
  }

  const resend = new Resend(RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: 'Gita <geeta@prasuco.com>',
      to: [email!],
      subject: 'Welcome',
      html: welcomeEmail(email?.split('@')[0]!),
    });

    if (error) throw new Error(error.message || "Unknown error");

    return new Response(null, {
      status: 302,
      headers: { Location: "/success" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, message: "Email sending failed." }),
      { status: 500 }
    );
  }
}
