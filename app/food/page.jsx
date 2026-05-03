"use client";
import React, { useState, useEffect } from 'react';
import { Search, Star, Clock, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function FoodPage() {
  const [categories, setCategories] = useState(['All', 'Fast Food', 'Local', 'Desserts', 'Drinks']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  async function fetchRestaurants() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .select('*')
        .order('is_featured', { ascending: false });

      if (error) throw error;
      setRestaurants(data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      // Fallback to empty or sample data if needed
    } finally {
      setLoading(false);
    }
  }

  const filteredRestaurants = activeCategory === 'All' 
    ? restaurants 
    : restaurants.filter(r => r.category === activeCategory);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="text-headline-md" style={{ marginBottom: '24px' }}>Food Delivery</h2>
      
      <div className="card" style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Search size={20} color="var(--color-on-surface-variant)" />
        <input type="text" placeholder="What are you craving in Butuan?" style={{ flex: 1, border: 'none', outline: 'none', fontSize: '16px', background: 'transparent' }} />
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
          <Loader2 className="animate-spin" size={32} color="var(--color-primary)" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
          {filteredRestaurants.length > 0 ? filteredRestaurants.map((r) => (
            <div key={r.id} className="card shadow-level-1" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ 
                height: '140px', 
                backgroundImage: `url(${r.image_url})`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                backgroundColor: 'var(--color-surface-container-high)' 
              }}></div>
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
      
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}
