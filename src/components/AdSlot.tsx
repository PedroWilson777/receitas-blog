"use client";
import { useEffect } from "react";

// Sem env vars configuradas, não renderiza nada (evita placeholder vazio
// pouco profissional). Assim que o AdSense aprovar, configurar no Vercel:
//   NEXT_PUBLIC_ADSENSE_PUB_ID=ca-pub-XXXXXXXXXXXXXXXX
//   NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR=XXXXXXXXXX
//   NEXT_PUBLIC_ADSENSE_SLOT_BANNER=XXXXXXXXXX
// e o anúncio real ativa sozinho, sem mexer em código.
const PUB_ID = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID;
const SLOT_SIDEBAR = process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR;
const SLOT_BANNER = process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER;

export default function AdSlot({ size }: { size: "sidebar" | "banner" }) {
  const slot = size === "sidebar" ? SLOT_SIDEBAR : SLOT_BANNER;
  const ativo = Boolean(PUB_ID && slot);

  useEffect(() => {
    if (!ativo) return;
    try {
      const w = window as unknown as { adsbygoogle?: unknown[] };
      (w.adsbygoogle = w.adsbygoogle || []).push({});
    } catch {
      // AdSense ainda não carregou ou bloqueador de anúncios ativo
    }
  }, [ativo]);

  if (!ativo) return null;

  return (
    <ins
      className="adsbygoogle"
      style={{ display: "block", minHeight: size === "sidebar" ? 250 : 64 }}
      data-ad-client={PUB_ID}
      data-ad-slot={slot}
      data-ad-format={size === "sidebar" ? "auto" : "horizontal"}
      data-full-width-responsive="true"
    />
  );
}
