import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Copy } from "lucide-react";
import toast from "react-hot-toast";

const QRCodeDisplay = ({ qrValue }) => {
  const qrRef = React.useRef();

  if (!qrValue || typeof qrValue !== "string") {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-100">
        <p className="text-red-500 text-center">Error: Invalid QR value</p>
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
      ctx.drawImage(img, 0, 0);
      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `booking-qr.png`;
      link.href = pngUrl;
      link.click();
      toast.success("QR Code downloaded!");
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-4">QR Code</h3>
      <p className="text-sm text-gray-600 mb-6">Scan with your mobile phone</p>

      <div className="flex flex-col items-center gap-6">
        <div ref={qrRef} className="p-4 bg-white border-2 border-gray-200 rounded-lg">
          <QRCodeSVG value={qrValue} size={256} level="H" includeMargin={true} />
        </div>

        <button
          onClick={downloadQRCode}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold"
        >
          <Download size={18} className="inline mr-2" />
          Download
        </button>

        <div className="w-full bg-gray-50 p-3 rounded-lg border border-gray-200">
          <p className="text-xs text-gray-600 mb-1">📍 URL:</p>
          <p className="text-xs text-gray-800 break-all font-mono">{qrValue}</p>
        </div>
      </div>
    </div>
  );
};

export default QRCodeDisplay;