"use client";
import React, { useState } from 'react';

export default function Dashboard() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [subscriptions, setSubscriptions] = useState([
    { id: 1, name: 'Netflix', price: 189.99, category: 'Eğlence' },
    { id: 2, name: 'Spotify', price: 59.99, category: 'Müzik' },
  ]);

  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  // Yeni Abonelik Ekleme Fonksiyonu
  const addSubscription = (e) => {
    e.preventDefault();
    if (!newName || !newPrice) return;
    const newSub = {
      id: Date.now(),
      name: newName,
      price: parseFloat(newPrice),
      category: 'Genel'
    };
    setSubscriptions([...subscriptions, newSub]);
    setNewName(''); setNewPrice(''); setIsFormOpen(false);
  };

  // Abonelik Silme Fonksiyonu (Filtreleme yöntemiyle)
  const deleteSubscription = (id) => {
    setSubscriptions(subscriptions.filter(sub => sub.id !== id));
  };

  const totalMonthly = subscriptions.reduce((acc, curr) => acc + curr.price, 0);
  const totalYearly = totalMonthly * 12;

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-black p-6 font-sans">
      <div className="max-w-md mx-auto">
        
        {/* Özet Kartı */}
        <header className="bg-white rounded-[32px] p-8 shadow-sm mb-6 text-center border border-white">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px] mb-2">Toplam Harcama</p>
          <h1 className="text-5xl font-black tracking-tighter">{totalMonthly.toLocaleString('tr-TR')} TL</h1>
          <div className="mt-4 py-1 px-3 bg-gray-100 rounded-full inline-block">
            <p className="text-[11px] text-gray-500 font-medium">Yıllık Tahmin: <b>{totalYearly.toLocaleString('tr-TR')} TL</b></p>
          </div>
        </header>

        <button 
          onClick={() => setIsFormOpen(true)}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold mb-8 active:scale-95 transition-all shadow-lg shadow-blue-200"
        >
          + Yeni Abonelik Ekle
        </button>

        {/* Abonelik Listesi */}
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-gray-400 ml-2 mb-2 uppercase tracking-wider">Aboneliklerin</h2>
          {subscriptions.map((sub) => (
            <div key={sub.id} className="bg-white p-4 rounded-2xl flex justify-between items-center group animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center font-bold text-gray-400 text-xs">
                  {sub.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-sm text-gray-800">{sub.name}</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">{sub.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-extrabold text-sm">{sub.price} TL</p>
                <button 
                  onClick={() => deleteSubscription(sub.id)}
                  className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                  title="Sil"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Form */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50">
            <div className="bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl animate-in slide-in-from-bottom-10">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
              <h2 className="text-2xl font-black mb-6">Yeni Ekle</h2>
              <form onSubmit={addSubscription} className="space-y-4">
                <input 
                  type="text" placeholder="Hizmet Adı" 
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  value={newName} onChange={(e) => setNewName(e.target.value)}
                />
                <input 
                  type="number" placeholder="Aylık Fiyat" 
                  className="w-full p-4 bg-gray-50 rounded-2xl border-none outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                  value={newPrice} onChange={(e) => setNewPrice(e.target.value)}
                />
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-[2] bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100">Ekle</button>
                  <button type="button" onClick={() => setIsFormOpen(false)} className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-2xl font-bold">Vazgeç</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}