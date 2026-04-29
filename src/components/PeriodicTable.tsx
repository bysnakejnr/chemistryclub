import { useLayoutEffect, useMemo, useRef, useState, useEffect } from 'react'
import { elements as staticElements } from '../data/elements'
import { testProxyConnection, fetchElementsFromProxy } from '../lib/notion-proxy-server'
import { allElements } from './AllElements'
import type { ChemElement } from '../types'
import '../styles/PeriodicTable.css'
import '../styles/ElementDetail.css'

type ElementCategory =
  | 'metal'
  | 'metalloid'
  | 'nonmetal'
  | 'hydrogen'
  | 'halogen'
  | 'noble_gas'
  | 'lanthanide'
  | 'actinide'

const metalloidSymbols = new Set(['B', 'Si', 'Ge', 'As', 'Sb', 'Te', 'Po'])
const isLanthanide = (el: ChemElement) => el.atomicNumber >= 58 && el.atomicNumber <= 71
const isActinide = (el: ChemElement) => el.atomicNumber >= 90 && el.atomicNumber <= 103

function getElementCategory(el: ChemElement): ElementCategory {
  // Prefer explicit series ranges for f-block coloring.
  if (isLanthanide(el)) return 'lanthanide'
  if (isActinide(el)) return 'actinide'

  if (el.symbol === 'H') return 'hydrogen'
  if (el.group === 18) return 'noble_gas'
  if (el.group === 17) return 'halogen'

  if (metalloidSymbols.has(el.symbol)) return 'metalloid'

  // Simple non-metal grouping for typical examples.
  if (el.group === 14 || el.group === 15 || el.group === 16) return 'nonmetal'

  return 'metal'
}


interface ElementDetailProps {
  element: ChemElement
  onClose: () => void
}

function ElementDetail({ element, onClose }: ElementDetailProps) {
  return (
    <div className="element-detail-modal" onClick={onClose}>
      <div className="element-detail-card" onClick={(e) => e.stopPropagation()}>
        <div className="element-detail-header">
          <div className="element-detail-title">
            <div className="element-number">Element {element.atomicNumber}</div>
            <h2>
              {element.name}{' '}
              <span className="element-symbol">({element.symbol})</span>
            </h2>
            <div className="element-location">
              Period {element.period}
              {element.group ? ` · Group ${element.group}` : ' · f-block'}
            </div>
          </div>
          <button type="button" onClick={onClose} className="element-detail-close">
            Close
          </button>
        </div>

        <div className="element-detail-content">
          <div className="element-detail-info">
            <div className="element-detail-number-display">
              <div className="label">Atomic no.</div>
              <div className="number">{element.atomicNumber}</div>
            </div>
            <div className="element-detail-symbol-display">
              <div className="symbol-info">
                <div className="symbol-label">Symbol</div>
                <div className="symbol">{element.symbol}</div>
              </div>
              <div className="element-detail-status">
                <span className={`status-dot ${!element.isCompleted ? 'incomplete' : ''}`} />
              </div>
            </div>
          </div>

          <div className="element-detail-grid">
            <DetailItem
              label="Real life usage"
              value={
                element.realLifeUsage ?? 'We have not added our notes for this element yet.'
              }
            />
            <DetailItem
              label="Most common use / compound"
              value={
                element.mostCommonUseOrCompound ??
                'You can fill this from your Notion database later.'
              }
            />
            <DetailItem
              label="When discovered"
              value={
                element.discoveredWhen ?? 'Discovery story coming soon in our Chem Club notes.'
              }
            />
            <DetailItem
              label="What makes it toxic / radioactive?"
              value={
                element.toxicOrRadioactiveCause ??
                'Add toxicity or radioactivity notes for this element.'
              }
            />
            <DetailItem
              label="What does it consist of?"
              value={
                element.compositionNote ?? 'You can add protons / neutrons / electrons counts here.'
              }
            />
            <DetailItem
              label="Where can we find it?"
              value={
                element.whereFound ?? 'Use this to describe ores, everyday products, or places this element shows up.'
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}

interface DetailItemProps {
  label: string
  value: string
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="detail-item">
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  )
}

function ElementTile({
  el,
  onClick,
}: {
  el: ChemElement | null
  onClick: () => void
}) {
  const isEmpty = !el
  const nameRef = useRef<HTMLSpanElement | null>(null)
  const [showName, setShowName] = useState(true)

  const category = el ? getElementCategory(el) : 'metal'
  const isDone = el?.isCompleted ?? false

  const atomicNumber = el?.atomicNumber
  const elementName = el?.name

  useLayoutEffect(() => {
    if (!atomicNumber) return
    const node = nameRef.current
    if (!node) return

    // If the name doesn't fit on one line, hide it entirely for clean tiles.
    const fits = node.scrollWidth <= node.clientWidth
    setShowName(fits)
  }, [atomicNumber, elementName])

  // Build CSS classes
  const tileClasses = [
    'element-tile',
    isEmpty ? 'empty' : (isDone ? 'discovered' : 'undiscovered'),
    !isEmpty && isDone ? category : ''
  ].filter(Boolean).join(' ')

  // Debug: Log element completion status and classes
  if (el && (el.name === 'Hydrogen' || el.name === 'Boron')) {
    console.log(`🔍 Element ${el.name}:`)
    console.log(`- isCompleted: ${el.isCompleted}`)
    console.log(`- isDone: ${isDone}`)
    console.log(`- category: ${category}`)
    console.log(`- classes: "${tileClasses}"`)
    console.log(`- should show completion dot: ${el.isCompleted}`)
  }

  
  return (
    <button
      type="button"
      className={tileClasses}
      disabled={isEmpty}
      onClick={isEmpty ? undefined : onClick}
    >
      {el && (
        <>
          <span className="atomic-number">{el.atomicNumber}</span>
          <span className="symbol">{el.symbol}</span>
          {showName && (
            <span ref={nameRef} className="name">
              {el.name}
            </span>
          )}
          {el.isCompleted && (
            <span className="completion-dot" />
          )}
        </>
      )}
    </button>
  )
}

export function PeriodicTable() {
  console.log('🔄 PeriodicTable with Notion Proxy rendering!')
  
  const [selected, setSelected] = useState<ChemElement | null>(null)
  const [elements, setElements] = useState<ChemElement[]>([])
  const [loading, setLoading] = useState(true)
  const [notionConnected, setNotionConnected] = useState(false)

  // Load elements from Notion or fallback
  useEffect(() => {
    async function loadElements() {
      try {
        console.log('🔄 Testing Notion proxy connection...')
        const isConnected = await testProxyConnection()
        setNotionConnected(isConnected)
        
        if (isConnected) {
          console.log('🔄 Loading elements from Notion proxy...')
          const notionElements = await fetchElementsFromProxy()
          console.log(`✅ Loaded ${notionElements.length} elements from Notion`)
          
          // Debug: Check for specific elements
          const hydrogen = notionElements.find(n => n.atomicNumber === 1)
          const boron = notionElements.find(n => n.atomicNumber === 5)
          console.log(`🔍 Hydrogen in Notion:`, hydrogen ? { isCompleted: hydrogen.isCompleted, name: hydrogen.name } : 'NOT FOUND')
          console.log(`🔍 Boron in Notion:`, boron ? { isCompleted: boron.isCompleted, name: boron.name } : 'NOT FOUND')
          
          // Create full periodic table with Notion data
          const fullElements = allElements.map(element => {
            const notionElement = notionElements.find(n => n.atomicNumber === element.atomicNumber)
            if (notionElement) {
              return notionElement
            }
            
            // Return NOT YET DISCOVERED for elements without Notion data
            return {
              atomicNumber: element.atomicNumber,
              symbol: element.symbol,
              name: element.name,
              group: element.group,
              period: element.period,
              block: element.block as 's' | 'p' | 'd' | 'f',
              isCompleted: false,
              realLifeUsage: 'NOT YET DISCOVERED - Add this element to your Notion database to see detailed information here.',
              mostCommonUseOrCompound: 'NOT YET DISCOVERED',
              discoveredWhen: 'NOT YET DISCOVERED',
              toxicOrRadioactiveCause: 'NOT YET DISCOVERED',
              compositionNote: 'NOT YET DISCOVERED',
              whereFound: 'NOT YET DISCOVERED'
            }
          })
          
          setElements(fullElements)
        } else {
          console.log('❌ Notion proxy failed, using fallback data')
          // Fallback to static data
          setElements(staticElements)
        }
      } catch (error) {
        console.error('❌ Failed to load elements:', error)
        setElements(staticElements)
      } finally {
        setLoading(false)
      }
    }

    loadElements()
  }, [])

  const tableRows = useMemo(() => {
    const byPeriodGroup = new Map<string, ChemElement>()
    for (const el of elements) {
      if (el.group == null) continue
      byPeriodGroup.set(`${el.period}-${el.group}`, el)
    }

    const getMainSlot = (period: number, group: number) =>
      byPeriodGroup.get(`${period}-${group}`) ?? null

    const getMainRow = (period: number): (ChemElement | null)[] => {
      const row: (ChemElement | null)[] = []
      for (let group = 1; group <= 18; group += 1) {
        row.push(getMainSlot(period, group))
      }
      return row
    }

    const lanthanides = []
    for (let n = 58; n <= 71; n += 1) {
      lanthanides.push(elements.find((el) => el.atomicNumber === n) ?? null)
    }

    const actinides = []
    for (let n = 90; n <= 103; n += 1) {
      actinides.push(elements.find((el) => el.atomicNumber === n) ?? null)
    }

    // Align lanthanides/actinides under columns 4..17 by adding empty cells for columns 1..3 and 18.
    const lanthanidesRow: (ChemElement | null)[] = [
      null,
      null,
      null,
      ...lanthanides,
      null,
    ]

    const actinidesRow: (ChemElement | null)[] = [
      null,
      null,
      null,
      ...actinides,
      null,
    ]

    return [1, 2, 3, 4, 5, 6].map((p) => getMainRow(p)).concat([
      lanthanidesRow,
      getMainRow(7),
      actinidesRow,
    ])
  }, [elements])

  const handleClick = (el: ChemElement | null) => {
    if (!el) return
    setSelected(el)
  }

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        fontSize: '18px',
        color: 'var(--muted)',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div>Loading periodic table...</div>
        <div style={{ fontSize: '14px', opacity: 0.7 }}>
          {notionConnected ? 'Connecting to Notion...' : 'Starting up...'}
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 className="page-title">Periodic Table</h1>
        </div>
        <div className="chip-row" aria-label="Legend">
          <div className="pill">
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                backgroundColor: 'rgba(192, 192, 192, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  backgroundColor: 'rgba(96, 96, 96, 0.9)',
                }}
              />
            </div>
          </div>
          <div className="pill">
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                backgroundColor: 'var(--periodic-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  backgroundColor: 'var(--periodic-muted)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="periodic-table-container">
        <div className="periodic-table-grid">
          {tableRows.map((row, rowIndex) =>
            row.map((el, colIndex) => (
              <ElementTile
                key={`${rowIndex}-${colIndex}-${el?.atomicNumber ?? 'empty'}`}
                el={el}
                onClick={() => handleClick(el)}
              />
            )),
          )}
        </div>
      </div>

      <p style={{ fontSize: 12, color: 'var(--muted)' }}>
        Want every tile to pull from Notion? Add a Notion-backed API later and map each element by its atomic number
        or symbol, keeping this visual layout exactly the same.
      </p>

      {selected && (
        <ElementDetail element={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}

