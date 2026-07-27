/** Sends a short text alert to the admin Discord channel, if configured. */
export async function sendDiscordAlert(content: string) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return; // Not configured — no-op rather than throw.

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
  } catch (err) {
    console.error("[DISCORD_WEBHOOK_ERROR]", err);
  }
}
