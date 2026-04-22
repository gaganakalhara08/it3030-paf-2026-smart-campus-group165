import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download } from "lucide-react";
import toast from "react-hot-toast";

const QRCodeDisplay = ({ qrValue, bookingUrl, bookingId }) => {
  const qrRef = React.useRef(null);

  const resolvedValue =
    (typeof qrValue === "string" && qrValue.trim()) ||
    (typeof bookingUrl === "string" && bookingUrl.trim()) ||
    (bookingId ? `${window.location.origin}/user/bookings/${bookingId}/check-in` : "");

  if (!resolvedValue) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
        <p className="text-center text-sm font-semibold text-rose-700">Error: Invalid QR value</p>
      </div>
    );
  }

  const downloadQRCode = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      }
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "booking-qr.png";
      link.href = pngUrl;
      link.click();
      toast.success("QR Code downloaded!");
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-slate-800">Booking QR</h3>
      <p className="mt-1 text-sm text-slate-500">Use this QR at check-in</p>

      <div className="mt-5 flex flex-col items-center gap-4">
        <div
          ref={qrRef}
          className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-cyan-50 p-4"
        >
          <QRCodeSVG value={resolvedValue} size={220} level="H" includeMargin={true} />
        </div>

        <button
          onClick={downloadQRCode}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
        >
          <Download size={16} />
          Download QR
        </button>

        <div className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">QR URL</p>
          <p className="break-all font-mono text-xs text-slate-700">{resolvedValue}</p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeDisplay;

