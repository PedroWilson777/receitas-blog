"use client";
// Slot de anúncio — troca o placeholder pelo script do AdSense quando aprovado
export default function AdSlot({ size }: { size: "sidebar" | "banner" }) {
  if (size === "sidebar") {
    return (
      <div className="w-full bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-300 text-xs" style={{ minHeight: 250 }}>
        Publicidade
      </div>
    );
  }
  return (
    <div className="w-full bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-300 text-xs h-16">
      Publicidade
    </div>
  );
}
