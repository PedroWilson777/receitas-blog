// ads.txt dinâmico — usa a mesma env var do AdSlot, então não precisa editar
// nada manualmente quando o publisher ID for configurado no Vercel.
export async function GET() {
  const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID;

  const body = pubId
    ? `google.com, ${pubId.replace("ca-", "")}, DIRECT, f08c47fec0942fa0\n`
    : "";

  return new Response(body, {
    headers: { "Content-Type": "text/plain" },
  });
}
