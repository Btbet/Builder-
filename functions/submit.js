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
