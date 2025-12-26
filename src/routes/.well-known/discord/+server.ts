export async function GET() {
  return new Response("dh=5658e47835aee50ef2882ea2de4c603c1024951d", {
    headers: { "Content-Type": "text/plain" },
  });
}
