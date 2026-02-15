import { Resend } from 'resend';
import { welcomeEmail } from '../utils/welcomeEmail';

// @ts-ignore
export async function GET({ request }) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email');

  const resend = new Resend(import.meta.env.RESEND_API_KEY);

  const { data, error } = await resend.emails.send({
    from: 'Gita <geeta@prasuco.com>',
    to: [`${email}`],
    subject: 'Welcome',
    html: welcomeEmail(email?.split('@')[0]!),
  });


  if (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "email sending failed.",
      }),
      { status: 500 }
    );
  }


  return new Response(null, {
    status: 302, // or 303
    headers: {
      Location: "/success",
    },
  });
}
