import React, { useEffect, useMemo, useState } from 'react';
import { styles } from '../../styles/styles';
import { Clipboard, Check } from 'lucide-react';

export default function LocationChips({ locations = [] }) {
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState(true);
  const [copied, setCopied] = useState(null);

  const local = {
    headerRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '0.75rem',
    },
    searchInput: {
      padding: '0.55rem 0.75rem',
      borderRadius: '8px',
      border: '1px solid #e9ecef',
      minWidth: '220px',
      fontSize: '0.95rem',
    },
    collapseBtn: {
      padding: '0.45rem 0.7rem',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      background: '#f1f5f9',
      color: '#334155',
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    countBadge: {
      marginLeft: '0.5rem',
      background: '#e6eefc',
      color: '#27408b',
      padding: '0.15rem 0.5rem',
      borderRadius: '999px',
      fontSize: '0.85rem',
      fontWeight: 700,
    },
    chip: {
      position: 'relative',
      padding: '0.9rem 1rem',
      borderRadius: '10px',
      fontSize: '0.95rem',
      fontWeight: 500,
      cursor: 'pointer',
      userSelect: 'none',
      background: '#f8fafc',
      transition: 'all 0.25s ease',
      overflow: 'hidden',
      border: '1px solid #e5e7eb',
    },
    chipCopied: {
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
      transform: 'scale(1.02)',
      boxShadow: '0 8px 18px rgba(102,126,234,0.18)',
      filter: 'brightness(1.05)',
    },
    copyIcon: {
      position: 'absolute',
      top: '8px',
      right: '8px',
      color: '#64748b',
      opacity: 0.8,
      transition: 'opacity 0.25s ease, transform 0.25s ease',
    },
    copiedOverlay: {
      position: 'absolute',
      inset: 0,
      backdropFilter: 'blur(4px) brightness(1.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontWeight: 600,
      letterSpacing: '0.5px',
      background: 'rgba(0,0,0,0.3)',
      transition: 'opacity 0.3s ease',
    },
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter((l) => l.toLowerCase().includes(q));
  }, [locations, query]);

  const handleCopy = async (loc) => {
    try {
      await navigator.clipboard.writeText(loc);
      setCopied(loc);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  useEffect (() => {
    document.querySelector('body').addEventListener("click", () => {
      setCopied(null);
    })
  }, [])

  return (
    <div style={{ marginTop: '2rem' }}>
      <div style={local.headerRow}>
        <div>
          <h4 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#111827', margin: 0 }}>
            ALL AVAILABLE LOCATIONS
            <span style={local.countBadge}>{locations.length}</span>
          </h4>
          <p style={{ margin: '6px 0 0 0', color: '#6b7280', fontSize: '0.9rem' }}>
            Click the icon to copy any location.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            placeholder="Search locations..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCollapsed(false);
              setCopied(null);
            }}
            style={local.searchInput}
          />

          <button
            onClick={() => {
              setCollapsed((s) => !s);
              setCopied(null);
            }}
            style={local.collapseBtn}
          >
            {collapsed ? 'Show' : 'Hide'}
            <span style={{ opacity: 0.7 }}>{collapsed ? '▾' : '▴'}</span>
          </button>
        </div>
      </div>

      {!collapsed && (
        <div style={styles.locationGrid}>
          {filtered.length === 0 ? (
            <div style={{ color: '#6b7280', gridColumn: '1/-1', padding: '1rem' }}>
              No locations match "{query}".
            </div>
          ) : (
            filtered.map((l) => {
              const isCopied = copied === l;
              return (
                <div
                  key={l}
                  onClick={() => handleCopy(l)}
                  style={{
                    ...local.chip,
                    ...(isCopied ? local.chipCopied : {}),
                  }}
                >
                  <span>{l}</span>

                  {!isCopied && (
                    <Clipboard
                      size={17}
                      style={{
                        ...local.copyIcon,
                      }}
                    />
                  )}

                  {isCopied && (
                    <div style={local.copiedOverlay}>
                      <Check size={18} style={{ marginRight: '6px' }} /> Copied
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
