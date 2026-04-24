import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export function KMCardScanner({ onScan, onError }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "km-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    const onScanSuccess = (decodedText) => {
      scanner.clear();
      if(onScan) onScan(decodedText);
    };

    const onScanFailure = (error) => {
      if(onError) onError(error);
    };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(e => console.error(e));
    };
  }, [onScan, onError]);

  return <div id="km-reader" className="w-full bg-white overflow-hidden rounded-xl"></div>;
}
