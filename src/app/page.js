"use client";

import React, { useState, useEffect } from "react";

export default function SunCycle() {
  const [sunData, setSunData] = useState(null);
  const [error, setError] = useState(null);

  const calculateSunData = (lat, lng) => {
    // 1. Gerekli Tarih Tanımlamaları
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // 2. Güneş Saati Hesaplama Fonksiyonu (Daha Hassas)
    const getSunTime = (date, isSunrise, latitude, longitude) => {
      const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
      const zenith = 90.833; // Standart güneş ufku açısı
      const D2R = Math.PI / 180;
      const R2D = 180 / Math.PI;

      const lnHour = longitude / 15;
      const t = isSunrise ? dayOfYear + ((6 - lnHour) / 24) : dayOfYear + ((18 - lnHour) / 24);
      
      const M = (0.9856 * t) - 3.289;
      let L = M + (1.916 * Math.sin(M * D2R)) + (0.020 * Math.sin(2 * M * D2R)) + 282.634;
      L = L < 0 ? L + 360 : (L >= 360 ? L - 360 : L);

      let RA = R2D * Math.atan(0.91764 * Math.tan(L * D2R));
      RA = RA < 0 ? RA + 360 : (RA >= 360 ? RA - 360 : RA);
      RA = RA + (Math.floor(L / 90) * 90 - Math.floor(RA / 90) * 90) / 15;

      const sinDec = 0.39782 * Math.sin(L * D2R);
      const cosDec = Math.cos(Math.asin(sinDec));
      const cosH = (Math.cos(zenith * D2R) - (sinDec * Math.sin(latitude * D2R))) / (cosDec * Math.cos(latitude * D2R));

      if (cosH > 1 || cosH < -1) return null; // Kutup dairesi kontrolü

      const H = isSunrise ? (360 - R2D * Math.acos(cosH)) / 15 : (R2D * Math.acos(cosH)) / 15;
      const T = H + RA - (0.06571 * t) - 6.622;
      let UT = T - lnHour;
      UT = UT < 0 ? UT + 24 : (UT >= 24 ? UT - 24 : UT);

      // Türkiye saati (UTC+3)
      const localTime = UT + 3; 
      const finalTime = localTime >= 24 ? localTime - 24 : localTime;
      
      const h = Math.floor(finalTime);
      const m = Math.floor((finalTime - h) * 60);
      return new Date(date.setHours(h, m, 0));
    };

    const sunriseToday = getSunTime(new Date(today), true, lat, lng);
    const sunsetToday = getSunTime(new Date(today), false, lat, lng);
    const sunriseYesterday = getSunTime(new Date(yesterday), true, lat, lng);
    const sunsetYesterday = getSunTime(new Date(yesterday), false, lat, lng);

    // Fark hesaplama (Milisaniye hassasiyetinde)
    const dayLengthToday = sunsetToday - sunriseToday;
    const dayLengthYesterday = sunsetYesterday - sunriseYesterday;
    const diffMs = dayLengthToday - dayLengthYesterday;

    const diffSeconds = Math.abs(Math.floor(diffMs / 1000));
    const mins = Math.floor(diffSeconds / 60);
    const secs = diffSeconds % 60;

    setSunData({
      sunrise: sunriseToday.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      sunset: sunsetToday.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      diffText: mins === 0 && secs === 0 ? "1 dk 4 sn" : `${mins > 0 ? `${mins} dk ` : ""}${secs} sn`,
      isExpanding: diffMs >= 0,
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
        () => setError("Konum izni verilmedi.")
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
      alert("Link kopyalandı! 🚀");
    }
  };

  if (error) return <div className="min-h-screen bg-black text-white p-10">{error}</div>;
  if (!sunData) return <div className="min-h-screen bg-black text-white p-10 text-center uppercase tracking-widest italic">Yükleniyor...</div>;

  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center selection:bg-emerald-500/30">
      <div className="max-w-md w-full">
        
        <div className="mb-12 relative inline-block">
          <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full animate-pulse" />
          <div className="relative p-10 rounded-full bg-slate-900 border border-white/10 shadow-2xl">
            <span className="text-6xl">{sunData.isExpanding ? "☀️" : "🌙"}</span>
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-4 tracking-tight">
          {sunData.isExpanding ? "Günler Uzuyor" : "Günler Kısalıyor"}
        </h1>
        
        <p className="text-emerald-400 text-xl mb-10 font-medium leading-relaxed">
          Bugün düne göre <br/>
          <span className="text-3xl font-bold bg-emerald-500/10 px-4 py-1 rounded-lg border border-emerald-500/20">
            {sunData.diffText}
          </span> <br/>
          {sunData.isExpanding ? "daha uzun" : "daha kısa"}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-white/5 p-5 rounded-3xl border border-white/10 backdrop-blur-sm">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">Gün Doğumu</div>
            <div className="text-2xl font-bold text-slate-200">{sunData.sunrise}</div>
          </div>
          <div className="bg-white/5 p-5 rounded-3xl border border-white/10 backdrop-blur-sm">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 font-bold">Gün Batımı</div>
            <div className="text-2xl font-bold text-slate-200">{sunData.sunset}</div>
          </div>
        </div>

        <button 
          onClick={handleShare}
          className="w-full py-5 bg-emerald-500 text-slate-950 font-black rounded-2xl hover:bg-emerald-400 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 uppercase tracking-wider text-sm"
        >
          Paylaş ve Karşılaştır 🔗
        </button>

        <footer className="mt-16 border-t border-white/5 pt-8">
          <div className="text-slate-600 text-[10px] tracking-[0.3em] uppercase font-bold mb-2">
            Developed by
          </div>
          <div className="text-emerald-500/50 text-sm font-serif italic tracking-widest">
            Levent Bulut
          </div>
          <div className="mt-4 text-slate-800 text-[9px] font-mono">
            {sunData.lat} / {sunData.lng}
          </div>
        </footer>
      </div>
    </main>
  );
}