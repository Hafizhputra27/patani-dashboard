import { useTheme } from '../store/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      aria-label={`Ganti ke tema ${theme === 'dark' ? 'terang' : 'gelap'}`}
      style={{ minWidth: 40, minHeight: 40, background: 'var(--glass)', border: '1px solid var(--glass-brd)', borderRadius: 8, color: 'var(--ink)', cursor: 'pointer' }}
    >
      {theme === 'dark' ? '☾' : '☀'}
    </button>
  )
}
