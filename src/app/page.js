"use client";

import React, { useState, useEffect } from "react";
import { Sun, Moon, ArrowUp, ArrowDown, MapPin } from "lucide-react";

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

    const diffText = `${mins > 0 ? `${mins} dk ` : ""}${secs} sn`;

    setSunData({
      sunrise: sunriseToday.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      sunset: sunsetToday.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }),
      diffText,
      isExpanding: diffMs > 0,
      lat: lat.toFixed(4),
      lng: lng.toFixed(4)
    });
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          calculateSunData(position.coords.latitude, position.coords.longitude);
        },
        () => setError("Konum izni verilmedi. Lütfen tarayıcı ayarlarından konuma izin verin.")
      );
    } else {
      setError("Tarayıcınız konum özelliğini desteklemiyor.");
    }
  }, []);

  if (error) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 text-center font-sans">{error}</div>;
  if (!sunData) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center font-sans tracking-widest uppercase italic">Yükleniyor...</div>;

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
        
        <p className="text-emerald-400 text-lg font-medium mb-12">
          Bugün düne göre <span className="text-2xl px-1 font-bold">{sunData.diffText}</span> {sunData.isExpanding ? "daha uzun" : "daha kısa"}
        </p>

        <div className="grid grid-cols-2 gap-4 w-full mb-12">
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
            <Sun className="w-5 h-5 text-emerald-400 mb-2 mx-auto" />
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-1 font-bold">Gün Doğumu</div>
            <div className="text-xl font-semibold text-slate-200">{sunData.sunrise}</div>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-sm">
            <Moon className="w-5 h-5 text-emerald-400 mb-2 mx-auto" />
            <div className="text-xs text-slate-500 uppercase tracking-widest mb-1 font-bold">Gün Batımı</div>
            <div className="text-xl font-semibold text-slate-200">{sunData.sunset}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-600 text-[10px] uppercase tracking-widest font-mono">
          <MapPin className="w-3 h-3" />
          <span>{sunData.lat} / {sunData.lng}</span>
        </div>

        <footer className="mt-20 pb-12">
          <div className="text-slate-700 text-[10px] tracking-[0.4em] uppercase mb-2">Developed by</div>
          <div className="text-emerald-500/40 text-sm font-serif italic tracking-widest">Levent Bulut</div>
        </footer>
      </div>
    </main>
  );
}