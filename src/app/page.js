"use client";
import React, { useState, useEffect } from 'react';
import SunCalc from 'suncalc';

export default function SunTracker() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

useEffect(() => {
    // 1. URL'deki parametreleri kontrol et (?lat=...&lng=...)
    const params = new URLSearchParams(window.location.search);
    const latParam = params.get('lat');
    const lngParam = params.get('lng');

    if (latParam && lngParam) {
      // Eğer URL'de konum varsa doğrudan hesapla (GPS sorma)
      calculateSunData(parseFloat(latParam), parseFloat(lngParam));
    } else if ("geolocation" in navigator) {
      // URL'de yoksa normal GPS sürecini başlat
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          calculateSunData(latitude, longitude);
          
          // Konum bulununca URL'yi güncelle (sayfa yenilenmeden)
          const newUrl = `${window.location.pathname}?lat=${latitude.toFixed(4)}&lng=${longitude.toFixed(4)}`;
          window.history.pushState({ path: newUrl }, '', newUrl);
        },
        () => setError("Konum izni verilmedi. Lütfen tarayıcı ayarlarından konuma izin verin.")
      );
    } else {
      setError("Tarayıcınız konum özelliğini desteklemiyor.");
    }
  }, []);

  const calculateSunData = (lat, lon) => {
    try {
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const timesToday = SunCalc.getTimes(today, lat, lon);
      const timesYesterday = SunCalc.getTimes(yesterday, lat, lon);

      const dayLengthToday = timesToday.sunset - timesToday.sunrise;
      const dayLengthYesterday = timesYesterday.sunset - timesYesterday.sunrise;
      const diffInMs = dayLengthToday - dayLengthYesterday;

      const totalSeconds = Math.abs(Math.round(diffInMs / 1000));
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;

      setData({
        sunrise: timesToday.sunrise.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        sunset: timesToday.sunset.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        mins: mins,
        secs: secs,
        isLengthening: diffInMs > 0
      });
    } catch (err) {
      setError("Hesaplama sırasında bir hata oluştu.");
    }
  };

  if (error) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl text-rose-500 text-center">
        {error}
      </div>
    </div>
  );

  if (!data) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-slate-500 animate-pulse font-medium">bulut.today hazırlanıyor...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 flex items-center justify-center font-sans">
      <div className="bg-slate-800 p-8 rounded-[40px] shadow-2xl w-full max-w-sm border border-slate-700">
        
        {/* Üst Başlık (bulut.today) */}
        <div className="text-center mb-10">
          <h1 className="text-xl font-black text-emerald-400 tracking-tighter mb-1">
            bulut.today
          </h1>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">
            Güneş Döngüsü Raporu
          </p>
          <p className="text-6xl mb-4">{data.isLengthening ? '☀️' : '🌙'}</p>
        </div>

        {/* Saat Bilgileri */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-900/50 p-5 rounded-3xl text-center border border-slate-700/50">
            <p className="text-[10px] font-bold text-orange-400 uppercase mb-1 tracking-wider">Doğum</p>
            <p className="text-xl font-black">{data.sunrise}</p>
          </div>
          <div className="bg-slate-900/50 p-5 rounded-3xl text-center border border-slate-700/50">
            <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1 tracking-wider">Batım</p>
            <p className="text-xl font-black">{data.sunset}</p>
          </div>
        </div>

        {/* Ana Durum Kartı */}
        <div className={`p-8 rounded-[32px] text-center transition-all ${data.isLengthening ? 'bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]' : 'bg-rose-500/10 border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.05)]'}`}>
          <p className="text-[11px] font-medium text-slate-400 mb-2 uppercase tracking-widest">
            Bugün gündüz süresi
          </p>
          <h2 className={`text-3xl font-black mb-1 ${data.isLengthening ? 'text-emerald-400' : 'text-rose-400'}`}>
            {data.mins > 0 ? `${data.mins} dk ` : ''}{data.secs} sn
          </h2>
          <p className={`text-xs font-black uppercase tracking-tighter ${data.isLengthening ? 'text-emerald-500/80' : 'text-rose-500/80'}`}>
            {data.isLengthening ? 'Uzuyor ↑' : 'Kısalıyor ↓'}
          </p>
        </div>

        {/* İmza Bölümü */}
        <div className="mt-10 pt-6 border-t border-slate-700/50 text-center">
          <p className="text-[10px] text-slate-500 mb-2 font-medium italic">
            Konumunuza göre anlık hesaplanmaktadır.
          </p>
          <button 
  onClick={() => {
    const text = `☀️ bulut.today | Bugün burada günler tam ${diffText} ${isExpanding ? 'uzadı' : 'kısaldı'}! \nSenin konumunda durum ne? Öğrenmek için tıkla:`;
    if (navigator.share) {
      navigator.share({
        title: 'bulut.today',
        text: text,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${text} ${window.location.href}`);
      alert("Link ve bilgiler kopyalandı! İstediğin yere yapıştırabilirsin. 🚀");
    }
  }}
  className="mt-8 px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all text-sm flex items-center gap-2 mx-auto"
>
  <span>🔗</span> Paylaş ve Karşılaştır
</button>
          <a 
            href="https://leventbulut.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="group inline-flex flex-col items-center"
          >
            <span className="text-[10px] text-slate-400 mb-1">Geliştirici</span>
            <span className="text-sm font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors flex items-center gap-1">
              Levent Bulut <span className="text-[10px] opacity-70">↗</span>
            </span>
          </a>
        </div>

      </div>
    </div>
  );
}