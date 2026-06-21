export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();

    // Basic validation
    if (!data?.name || !data?.email) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Name and email are required"
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json"
          }
        }
      );
    }

    // Insert into database
    await env.DB.prepare(
      `INSERT INTO submissions (name, email, phone)
       VALUES (?, ?, ?)`
    )
      .bind(
        data.name.trim(),
        data.email.trim(),
        data.phone || null
      )
      .run();

    // Send email (separate try so DB insert doesn't fail if email fails)
    try {
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "stackbuilderdavemindx@gmail.com",
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

      if (!emailRes.ok) {
        const errText = await emailRes.text();
        console.error("Email failed:", errText);
      }

    } catch (emailError) {
      console.error("Email request error:", emailError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Submission saved"
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
        error: error.message || "Server error"
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
