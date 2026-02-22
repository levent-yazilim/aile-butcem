"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon, ArrowUp, ArrowDown, MapPin, Share2 } from "lucide-react";

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
    } else if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          calculateSunData(latitude, longitude);
          const newUrl = `${window.location.pathname}?lat=${latitude.toFixed(4)}&lng=${longitude.toFixed(4)}`;
          window.history.pushState({ path: newUrl }, '', newUrl);
        },
        () => setError("Konum izni verilmedi. Lütfen konuma izin verin.")
      );
    } else {
      setError("Tarayıcınız konum özelliğini desteklemiyor.");
    }
  }, []);

  const handleShare = () => {
    if (!sunData) return;
    const text = `☀️ bulut.today | Bugün burada günler tam ${sunData.diffText} ${sunData.isExpanding ? 'uzadı' : 'kısaldı'}! \nSenin konumunda durum ne? Öğrenmek için tıkla:`;
    const url = window.location.href;

    if (navigator.share) {
      navigator.share({ title: 'bulut.today', text: text, url: url });
    } else {
      navigator.clipboard.writeText(`${text} ${url}`);
      alert("Link ve bilgiler kopyalandı! 🚀");
    }
  };

  if (error) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">{error}</div>;
  if (!sunData) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Yükleniyor...</div>;

  return (
    <main className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500/30">
      <div className="max-w-md mx-auto pt-20 px-6 flex flex-col items-center text-center">
        
        <div className="mb-12 relative">
          <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full" />
          <div className="relative bg-slate-900 border border-white/10 p-8 rounded-full shadow-2xl">
            {sunData.isExpanding ? (
              <ArrowUp className="w-16 h-16 text-emerald-400 animate-bounce" />
            ) : (
              <ArrowDown className="w-16 h-16 text-orange-400 animate-bounce" />
            )}
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-2 tracking-tight">
          {sunData.isExpanding ? "Günler Uzuyor" : "Günler Kısalıyor"}
        </h1>
        
        <p className="text-emerald-400 text-lg font-medium mb-8">
          Bugün düne göre <span className="text-2xl px-1">{sunData.diffText}</span> {sunData.isExpanding ? "daha uzun" : "daha kısa"}
        </p>

        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
            <Sun className="w-5 h-5 text-emerald-400 mb-2 mx-auto" />
            <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Gün Doğumu</div>
            <div className="text-xl font-semibold">{sunData.sunrise}</div>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
            <Moon className="w-5 h-5 text-emerald-400 mb-2 mx-auto" />
            <div className="text-xs text-slate-400 uppercase tracking-widest mb-1">Gün Batımı</div>
            <div className="text-xl font-semibold">{sunData.sunset}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500 text-sm mb-8">
          <MapPin className="w-4 h-4" />
          <span>Konum: {sunData.lat}, {sunData.lng}</span>
        </div>

        {/* PAYLAŞ BUTONU */}
        <button 
          onClick={handleShare}
          className="group relative flex items-center gap-2 px-8 py-4 bg-emerald-500 text-slate-950 font-bold rounded-full hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
        >
          <Share2 className="w-5 h-5" />
          <span>Paylaş ve Karşılaştır</span>
        </button>

        <footer className="mt-20 pb-10 text-slate-600 text-xs tracking-widest uppercase italic">
          levent bulut
        </footer>
      </div>
    </main>
  );
}