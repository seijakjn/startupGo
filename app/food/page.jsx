"use client";
import React, { useState, useEffect } from 'react';
import { Search, Star, Clock, Loader2, ShoppingBag, Plus, Minus, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import PaymentModal from '../components/PaymentModal';

// Sample fallback data shown when Supabase table doesn't exist yet
const SAMPLE_RESTAURANTS = [
  { id: 1, name: "Jollibee Butuan", category: "Fast Food", rating: 4.8, delivery_time: "20-30 min", image_url: "", is_featured: true,
    menu: [
      { id: 101, name: "Chickenjoy (1pc)", price: 99 },
      { id: 102, name: "Jolly Spaghetti", price: 89 },
      { id: 103, name: "Burger Steak", price: 109 },
    ]
  },
  { id: 2, name: "Chowking", category: "Local", rating: 4.5, delivery_time: "25-35 min", image_url: "", is_featured: true,
    menu: [
      { id: 201, name: "Chao Fan (Solo)", price: 79 },
      { id: 202, name: "Wonton Soup", price: 69 },
      { id: 203, name: "Halo-Halo", price: 89 },
    ]
  },
  { id: 3, name: "Mang Inasal", category: "Local", rating: 4.7, delivery_time: "15-25 min", image_url: "", is_featured: false,
    menu: [
      { id: 301, name: "Chicken Inasal (Paa)", price: 119 },
      { id: 302, name: "BBQ Liempo", price: 129 },
      { id: 303, name: "Halo-Halo Solo", price: 75 },
    ]
  },
  { id: 4, name: "Goldilocks", category: "Desserts", rating: 4.6, delivery_time: "30-40 min", image_url: "", is_featured: false,
    menu: [
      { id: 401, name: "Mocha Roll (Slice)", price: 55 },
      { id: 402, name: "Ensaymada", price: 45 },
      { id: 403, name: "Black Forest Cake (Slice)", price: 75 },
    ]
  },
  { id: 5, name: "Zagu", category: "Drinks", rating: 4.4, delivery_time: "10-20 min", image_url: "", is_featured: false,
    menu: [
      { id: 501, name: "Strawberry Pearl Shake", price: 65 },
      { id: 502, name: "Melon Pearl Shake", price: 65 },
    ]
  },
];

const BG_COLORS = ['#e0f2fe','#dcfce7','#fef9c3','#fce7f3','#ede9fe'];
const TEXT_COLORS = ['#0369a1','#166534','#854d0e','#9d174d','#5b21b6'];

export default function FoodPage() {
  const [categories] = useState(['All', 'Fast Food', 'Local', 'Desserts', 'Drinks']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [cart, setCart] = useState({}); // { itemId: quantity }
  const [paymentOpen, setPaymentOpen] = useState(false);

  useEffect(() => { fetchRestaurants(); }, []);

  async function fetchRestaurants() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('is_featured', { ascending: false });

      if (error) throw error;
      // Merge menu from sample data (Supabase table may not have menu column yet)
      const merged = (data || []).map(r => ({
        ...r,
        menu: SAMPLE_RESTAURANTS.find(s => s.name === r.name)?.menu || []
      }));
      setRestaurants(merged.length > 0 ? merged : SAMPLE_RESTAURANTS);
    } catch {
      // Supabase table not set up yet — use sample data silently
      setRestaurants(SAMPLE_RESTAURANTS);
    } finally {
      setLoading(false);
    }
  }

  const filteredRestaurants = activeCategory === 'All'
    ? restaurants
    : restaurants.filter(r => r.category === activeCategory);

  const addToCart = (itemId) => setCart(c => ({ ...c, [itemId]: (c[itemId] || 0) + 1 }));
  const removeFromCart = (itemId) => setCart(c => {
    const next = { ...c };
    if (next[itemId] > 1) next[itemId]--;
    else delete next[itemId];
    return next;
  });

  const cartTotal = selectedRestaurant
    ? (selectedRestaurant.menu || []).reduce((sum, item) => sum + (cart[item.id] || 0) * item.price, 0)
    : 0;
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const handleOpenRestaurant = (r) => {
    setSelectedRestaurant(r);
    setCart({});
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Restaurant detail view */}
      {selectedRestaurant ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <button
              onClick={() => setSelectedRestaurant(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', padding: 0 }}
            >
              ← Back
            </button>
            <h2 className="text-headline-md" style={{ margin: 0 }}>{selectedRestaurant.name}</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
            {(selectedRestaurant.menu || []).map(item => (
              <div key={item.id} className="card" style={{ display: 'flex', alignItems: 'center', padding: '16px' }}>
                <div style={{ flex: 1 }}>
                  <div className="text-label-lg">{item.name}</div>
                  <div className="text-body-sm" style={{ color: 'var(--color-primary)', fontWeight: '600', marginTop: '4px' }}>₱{item.price.toFixed(2)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {cart[item.id] > 0 && (
                    <>
                      <button onClick={() => removeFromCart(item.id)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--color-outline)', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-on-surface)' }}>
                        <Minus size={16} />
                      </button>
                      <span className="text-label-lg" style={{ minWidth: '20px', textAlign: 'center' }}>{cart[item.id]}</span>
                    </>
                  )}
                  <button onClick={() => addToCart(item.id)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: 'var(--color-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Sticky checkout bar */}
          {cartCount > 0 && (
            <div style={{ position: 'sticky', bottom: '80px' }}>
              <button
                className="btn btn-primary"
                style={{ width: '100%', height: '56px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingLeft: '24px', paddingRight: '24px' }}
                onClick={() => setPaymentOpen(true)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingBag size={20} />
                  {cartCount} item{cartCount > 1 ? 's' : ''} · Place Order
                </span>
                <span>₱{cartTotal.toFixed(2)}</span>
              </button>
            </div>
          )}

          <PaymentModal
            isOpen={paymentOpen}
            onClose={() => setPaymentOpen(false)}
            amount={cartTotal + 49} /* +₱49 delivery fee */
            serviceLabel={`Food Delivery — ${selectedRestaurant.name}`}
          />
        </>
      ) : (
        <>
          <h2 className="text-headline-md" style={{ marginBottom: '24px' }}>Food Delivery</h2>

          <div className="card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Search size={20} color="var(--color-on-surface-variant)" />
            <input type="text" placeholder="What are you craving in Butuan?" style={{ flex: 1, border: 'none', outline: 'none', fontSize: '16px' }} />
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '16px', marginBottom: '16px' }}>
            {categories.map((c) => (
              <div
                key={c}
                className={`chip ${activeCategory === c ? 'active' : ''}`}
                style={{ whiteSpace: 'nowrap', cursor: 'pointer' }}
                onClick={() => setActiveCategory(c)}
              >
                {c}
              </div>
            ))}
          </div>

          <h3 className="text-headline-sm" style={{ marginBottom: '16px' }}>{activeCategory} Restaurants</h3>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={32} color="var(--color-primary)" />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
              {filteredRestaurants.length > 0 ? filteredRestaurants.map((r, idx) => (
                <div
                  key={r.id}
                  className="card shadow-level-1"
                  style={{ padding: '0', overflow: 'hidden', cursor: 'pointer' }}
                  onClick={() => handleOpenRestaurant(r)}
                >
                  <div style={{
                    height: '140px',
                    backgroundImage: r.image_url ? `url(${r.image_url})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: BG_COLORS[idx % BG_COLORS.length],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {!r.image_url && (
                      <span style={{ fontSize: '36px', fontWeight: '800', color: TEXT_COLORS[idx % TEXT_COLORS.length], letterSpacing: '-1px' }}>
                        {r.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div className="text-label-lg">{r.name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '600' }}>
                        <Star size={14} fill="var(--color-primary)" color="var(--color-primary)" /> {r.rating}
                      </div>
                    </div>
                    <div className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: '12px' }}>{r.category}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--color-on-surface-variant)', fontSize: '12px' }}>
                      <Clock size={14} /> {r.delivery_time}
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--color-on-surface-variant)' }}>
                  No restaurants found in this category.
                </div>
              )}
            </div>
          )}
        </>
      )}

      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
}
