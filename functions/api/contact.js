// functions/api/contact.js

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();

    const name = formData.get("name") || "Unknown";
    const company = formData.get("company") || "";
    const email = formData.get("email") || "";
    const channel = formData.get("channel") || "";
    const projectType = formData.get("project-type") || "";
    const details = formData.get("details") || "";
    const timeline = formData.get("timeline") || "";

    // Where the email will be sent
    const toEmail = env.CONTACT_TO_EMAIL || "devaselan1995@gmail.com";

    // Who it appears to be from (use a domain you’ve verified in Resend)
    const fromEmail = env.CONTACT_FROM_EMAIL || "Zuka Contact <onboarding@resend.dev>";

    const subject = `New Zuka contact form submission from ${name}`;

    const html = `
      <h2>New Zuka contact form submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Company:</strong> ${company}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Preferred channel:</strong> ${channel}</p>
      <p><strong>Project type:</strong> ${projectType}</p>
      <p><strong>Timeline & budget:</strong> ${timeline}</p>
      <p><strong>Details:</strong></p>
      <p>${details.replace(/\n/g, "<br>")}</p>
    `;

    // Call Resend API
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject,
        html,
        // optional: make replies go to the user
        reply_to: email || undefined,
      }),
    });

    if (!resendResponse.ok) {
      const text = await resendResponse.text();
      console.error("Resend error:", resendResponse.status, text);
      return new Response("Failed to send email", { status: 500 });
    }

    // Redirect back with a ?sent=1 flag
    const url = new URL(request.url);
    url.pathname = "/";
    url.searchParams.set("sent", "1");
    return Response.redirect(url.toString(), 303);
  } catch (err) {
    console.error("Contact function error", err);
    return new Response("Server error", { status: 500 });
  }
}
