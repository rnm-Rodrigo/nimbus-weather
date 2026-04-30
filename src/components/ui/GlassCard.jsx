import { motion } from 'framer-motion'

/**
 * GlassCard
 * A themed glassmorphism card that adapts to the current weather theme.
 *
 * Props:
 *   theme       — theme config from useTheme
 *   children    — content
 *   className   — extra Tailwind classes
 *   onClick     — optional click handler
 *   animate     — whether to apply entry animation (default true)
 *   delay       — stagger delay in seconds (default 0)
 *   style       — extra inline styles
 */
export default function GlassCard({
  theme,
  children,
  className = '',
  onClick,
  animate = true,
  delay = 0,
  style = {},
}) {
  const cardStyle = {
    background:    theme?.cardBg    ?? 'rgba(255,255,255,0.08)',
    border:        `1px solid ${theme?.cardBorder ?? 'rgba(255,255,255,0.14)'}`,
    backdropFilter: 'blur(16px) saturate(1.3)',
    WebkitBackdropFilter: 'blur(16px) saturate(1.3)',
    borderRadius:  '20px',
    boxShadow:     '0 8px 32px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.04) inset',
    cursor:        onClick ? 'pointer' : undefined,
    ...style,
  }

  if (!animate) {
    return (
      <div className={className} style={cardStyle} onClick={onClick}>
        {children}
      </div>
    )
  }

  return (
    <motion.div
      className={className}
      style={cardStyle}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={onClick ? { scale: 1.015 } : undefined}
      whileTap={onClick  ? { scale: 0.985 } : undefined}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}
