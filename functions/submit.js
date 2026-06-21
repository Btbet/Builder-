export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();

    await env.DB.prepare(
      `INSERT INTO submissions
      (name, email, phone)
      VALUES (?, ?, ?)`
    )
    .bind(
      data.name,
      data.email,
      data.phone
    )
    .run();


    await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${env.RESEND_API_KEY}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    from: "onboarding@resend.dev",
    to: data.email,
    subject: "Your Free AI Business Guide",
    html: `
      <h2>Thank you for requesting the guide!</h2>
      <p>Your download is ready:</p>
      <p>
        <a href="https://builder-8we.pages.dev/guide.pdf">
          Download the PDF Guide
        </a>
      </p>
    `
  })
});

    return new Response(
      JSON.stringify({
        success: true
      }),
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

  } catch (error) {

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

  }
}
