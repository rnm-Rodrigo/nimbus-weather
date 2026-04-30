import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocations } from '../../context/LocationContext'

export default function LocationCarousel({ theme, activeLocation, onSelect }) {
  const { locations, removeLocation, setPrimary } = useLocations()

  const [activeIdx, setActiveIdx]     = useState(0)
  const [deleting,  setDeleting]      = useState(null) // id being deleted
  const [direction, setDirection]     = useState(1)    // 1=right, -1=left
  const dragStart = useRef(null)

  const tc = theme?.textColor  ?? '#fff'
  const tm = theme?.textMuted  ?? 'rgba(255,255,255,0.55)'
  const cb = theme?.cardBg     ?? 'rgba(255,255,255,0.08)'
  const cd = theme?.cardBorder ?? 'rgba(255,255,255,0.14)'
  const ac = theme?.accentColor ?? '#ffd84a'

  if (!locations.length) return null

  const clampedIdx = Math.min(activeIdx, locations.length - 1)

  // ── Navigation ────────────────────────────────────────────
  const goTo = (idx) => {
    setDirection(idx > clampedIdx ? 1 : -1)
    const next = Math.max(0, Math.min(idx, locations.length - 1))
    setActiveIdx(next)
    onSelect?.(locations[next])
  }

  const prev = () => goTo(clampedIdx - 1)
  const next = () => goTo(clampedIdx + 1)

  // ── Swipe detection ───────────────────────────────────────
  const onDragStart = (e) => {
    dragStart.current = e.touches?.[0]?.clientX ?? e.clientX
  }
  const onDragEnd = (e) => {
    if (dragStart.current === null) return
    const endX = e.changedTouches?.[0]?.clientX ?? e.clientX
    const diff = dragStart.current - endX
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev()
    dragStart.current = null
  }

  // ── Delete ────────────────────────────────────────────────
  const handleDelete = async (e, loc) => {
    e.stopPropagation()
    setDeleting(loc.id)
    await removeLocation(loc.id)
    setDeleting(null)
    // Move index back if we deleted the last item
    if (clampedIdx >= locations.length - 1) {
      setActiveIdx(Math.max(0, locations.length - 2))
    }
  }

  // ── Set primary ───────────────────────────────────────────
  const handleSetPrimary = async (e, loc) => {
    e.stopPropagation()
    await setPrimary(loc.id)
  }

  const slideVariants = {
    enter:  (d) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
  }

  const loc = locations[clampedIdx]

  return (
    <div style={{ userSelect: 'none' }}>

      {/* ── Pill nav row ──────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: '0.4rem', marginBottom: '0.6rem',
        overflowX: 'auto', paddingBottom: 2,
      }}
        className="hide-scrollbar"
      >
        {locations.map((l, i) => (
          <button
            key={l.id}
            onClick={() => goTo(i)}
            style={{
              flexShrink: 0,
              padding: '4px 12px',
              borderRadius: 20,
              border: `1px solid ${i === clampedIdx ? ac : cd}`,
              background: i === clampedIdx ? `${ac}22` : 'rgba(255,255,255,0.05)',
              color: i === clampedIdx ? ac : tm,
              fontSize: '0.72rem',
              fontWeight: i === clampedIdx ? 500 : 400,
              fontFamily: "'DM Sans', sans-serif",
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {l.city_name}
            {l.is_primary && ' ★'}
          </button>
        ))}
      </div>

      {/* ── Carousel card ─────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: 16,
          background: cb,
          border: `1px solid ${cd}`,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
        onMouseDown={onDragStart}
        onMouseUp={onDragEnd}
        onTouchStart={onDragStart}
        onTouchEnd={onDragEnd}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={loc.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            style={{ padding: '1rem 1.1rem' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

              {/* City info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  color: tc, fontWeight: 500, fontSize: '0.95rem',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {loc.city_name}
                  {loc.is_primary && (
                    <span style={{
                      fontSize: '0.62rem', background: `${ac}28`, color: ac,
                      border: `1px solid ${ac}55`, borderRadius: 10,
                      padding: '1px 7px', flexShrink: 0,
                    }}>
                      Primary
                    </span>
                  )}
                </div>
                <div style={{ color: tm, fontSize: '0.75rem', marginTop: 2 }}>
                  {loc.country_code} · {loc.lat.toFixed(2)}°, {loc.lon.toFixed(2)}°
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                {/* Set primary */}
                {!loc.is_primary && (
                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={(e) => handleSetPrimary(e, loc)}
                    title="Set as primary"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: tm, display: 'flex', padding: 6, borderRadius: 8,
                      transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = ac}
                    onMouseLeave={e => e.currentTarget.style.color = tm}
                  >
                    <Star size={15} />
                  </motion.button>
                )}

                {/* Delete */}
                <motion.button
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  onClick={(e) => handleDelete(e, loc)}
                  disabled={deleting === loc.id}
                  title="Remove city"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: tm, display: 'flex', padding: 6, borderRadius: 8,
                    transition: 'color 0.2s',
                    opacity: deleting === loc.id ? 0.4 : 1,
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f29090'}
                  onMouseLeave={e => e.currentTarget.style.color = tm}
                >
                  {deleting === loc.id
                    ? <span style={{ width: 15, height: 15, border: `2px solid ${tm}`, borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                    : <Trash2 size={15} />
                  }
                </motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Prev / Next arrows — only shown when multiple cities */}
        {locations.length > 1 && (
          <>
            <button
              onClick={prev}
              disabled={clampedIdx === 0}
              style={{
                position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: clampedIdx === 0 ? 'default' : 'pointer',
                color: clampedIdx === 0 ? 'transparent' : tm,
                padding: '0 6px', display: 'flex',
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              disabled={clampedIdx === locations.length - 1}
              style={{
                position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: clampedIdx === locations.length - 1 ? 'default' : 'pointer',
                color: clampedIdx === locations.length - 1 ? 'transparent' : tm,
                padding: '0 6px', display: 'flex',
              }}
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {locations.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: '0.5rem' }}>
          {locations.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                width: i === clampedIdx ? 16 : 6,
                height: 6,
                borderRadius: 3,
                border: 'none',
                cursor: 'pointer',
                background: i === clampedIdx ? ac : `${tc}33`,
                transition: 'all 0.3s',
                padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
