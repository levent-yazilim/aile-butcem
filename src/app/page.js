"use client";

import React, { useState, useEffect } from "react";

export default function SunCycle() {
  const [sunData, setSunData] = useState(null);
  const [error, setError] = useState(null);

  const calculateSunData = (lat, lng) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const getSunTime = (date, isSunrise, latitude, longitude) => {
      const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
      const hourAngle = isSunrise ? -0.5 : 0.5;
      const time = 12 - (hourAngle * 12) - (longitude / 15);
      return new Date(date.setHours(time, (time % 1) * 60, 0));
    };

    const sunriseToday = getSunTime(new Date(today), true, lat, lng);
    const sunsetToday = getSunTime(new Date(today), false, lat, lng);
    const sunriseYesterday = getSunTime(new Date(yesterday), true, lat, lng);
    const sunsetYesterday = getSunTime(new Date(yesterday), false, lat, lng);

    const dayLengthToday = sunsetToday - sunriseToday;
    const dayLengthYesterday = sunsetYesterday - sunriseYesterday;
    const diffMs = dayLengthToday - dayLengthYesterday;

    const diffSeconds = Math.abs(Math.floor(diffMs / 1000));
    const mins = Math.floor(diffSeconds / 60);
    const secs = diffSeconds % 60;

    setSunData({
      sunrise: sunriseToday.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      sunset: sunsetToday.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      diffText: `${mins > 0 ? `${mins} dk ` : ""}${secs} sn`,
      isExpanding: diffMs > 0,
      lat: lat.toFixed(4),
      lng: lng.toFixed(4)
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const latParam = params.get('lat');
    const lngParam = params.get('lng');

    if (latParam && lngParam) {
      calculateSunData(parseFloat(latParam), parseFloat(lngParam));
    } else if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          calculateSunData(latitude, longitude);
          const newUrl = `${window.location.pathname}?lat=${latitude.toFixed(4)}&lng=${longitude.toFixed(4)}`;
          window.history.pushState({ path: newUrl }, '', newUrl);
        },
        () => setError("Konum izni verilmedi. Lütfen konuma izin verin.")
      );
    }
  }, []);

  const handleShare = () => {
    if (!sunData) return;
    const shareText = `☀️ bulut.today | Bugün burada günler tam ${sunData.diffText} ${sunData.isExpanding ? 'uzadı' : 'kısaldı'}!`;
    const shareUrl = window.location.href;

    if (navigator.share) {
      navigator.share({ title: 'bulut.today', text: shareText, url: shareUrl });
    } else {
      navigator.clipboard.writeText(`${shareText} \n${shareUrl}`);
      alert("Link ve bilgiler kopyalandı! 🚀");
    }
  };

  if (error) return <div className="min-h-screen bg-black text-white p-10">{error}</div>;
  if (!sunData) return <div className="min-h-screen bg-black text-white p-10 text-center">Yükleniyor...</div>;

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full">
        {/* İkon Bölümü */}
        <div className="mb-8 inline-block p-10 rounded-full bg-slate-900 border border-white/10 shadow-2xl">
          <span className="text-6xl">{sunData.isExpanding ? "☀️" : "🌙"}</span>
        </div>

        <h1 className="text-4xl font-bold mb-4">
          {sunData.isExpanding ? "Günler Uzuyor" : "Günler Kısalıyor"}
        </h1>
        
        <p className="text-emerald-400 text-xl mb-10">
          Bugün düne göre <span className="font-bold border-b-2 border-emerald-500">{sunData.diffText}</span> {sunData.isExpanding ? "daha uzun" : "daha kısa"}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="text-xs text-slate-400 uppercase mb-1">Doğum</div>
            <div className="text-2xl font-semibold">{sunData.sunrise}</div>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
            <div className="text-xs text-slate-400 uppercase mb-1">Batım</div>
            <div className="text-2xl font-semibold">{sunData.sunset}</div>
          </div>
        </div>

        {/* PAYLAŞ BUTONU - TIKLANABİLİR ALANI GARANTİYE ALDIK */}
        <button 
          onClick={handleShare}
          className="w-full py-4 bg-emerald-500 text-slate-950 font-bold rounded-2xl hover:bg-emerald-400 active:scale-95 transition-all flex items-center justify-center gap-2 text-lg shadow-xl"
        >
          <span>🔗</span> Paylaş ve Karşılaştır
        </button>

        <div className="mt-8 text-slate-600 text-[10px] tracking-widest uppercase italic">
          levent bulut • {sunData.lat}, {sunData.lng}
        </div>
      </div>
    </main>
  );
}