import { useMemo, useState } from 'react'
import type { ChemTerm } from '../types'

interface DictionaryTableProps {
  terms: ChemTerm[]
}

export function DictionaryTable({ terms }: DictionaryTableProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return terms
    return terms.filter((term) => {
      const haystack = `${term.realWord} ${term.ourBetterWord} ${term.explanation}`.toLowerCase()
      return haystack.includes(q)
    })
  }, [terms, query])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.8rem',
        }}
      >
        <div
          style={{
            flex: 1,
            position: 'relative',
          }}
        >
          <input
            type="search"
            placeholder="Search by real word, Chem Club word, or explanation…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="dictionary-input"
            style={{
              width: '100%',
              borderRadius: 999,
              border: '1px solid rgba(148,163,184,0.7)',
              padding: '0.55rem 0.9rem',
              fontSize: 13,
              backgroundColor: 'rgba(255,255,255,0.96)',
            }}
          />
        </div>
        <div className="pill">
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 999,
              backgroundColor: 'var(--accent)',
            }}
          />
          {filtered.length} terms
        </div>
      </div>

      <div
        className="dictionary-table"
        style={{
          borderRadius: 18,
          border: '1px solid rgba(148,163,184,0.7)',
          overflow: 'hidden',
          backgroundColor: 'rgba(255,255,255,0.96)',
        }}
      >
        <div
          className="dictionary-header"
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 1.1fr 2fr',
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: 0.14,
            padding: '0.45rem 0.75rem',
            background:
              'linear-gradient(135deg, rgba(248,250,252,0.98), rgba(239,246,255,0.98))',
            color: 'var(--muted)',
            borderBottom: '1px solid rgba(148,163,184,0.7)',
          }}
        >
          <div>Real word</div>
          <div>Our better word</div>
          <div>Explanation</div>
        </div>

        {filtered.map((term, idx) => (
          <div
            key={term.id}
            className="dictionary-row"
            style={{
              display: 'grid',
              gridTemplateColumns: '1.1fr 1.1fr 2fr',
              padding: '0.55rem 0.75rem 0.6rem',
              fontSize: 13,
              backgroundColor:
                idx % 2 === 0 ? 'rgba(249,250,251,0.96)' : 'rgba(255,255,255,0.96)',
              borderBottom:
                idx === filtered.length - 1
                  ? 'none'
                  : '1px solid rgba(243,244,246,0.9)',
            }}
          >
            <div
              style={{
                fontWeight: 500,
              }}
            >
              {term.realWord}
            </div>
            <div
              style={{
                color: 'var(--accent)',
                fontWeight: 500,
              }}
            >
              {term.ourBetterWord}
            </div>
            <div
              style={{
                color: 'var(--muted)',
              }}
            >
              {term.explanation}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div
            style={{
              padding: '0.7rem 0.8rem',
              fontSize: 13,
              color: 'var(--muted)',
            }}
          >
            No terms match that search yet. Try a different word or add the term in your Notion
            database.
          </div>
        )}
      </div>
    </div>
  )
}

