import { SunIcon } from './Icons'

export default function ThemeToggle() {
  return (
    <button
      aria-label="Tema terang aktif"
      title="Tema terang aktif"
      style={{
        width: 36,
        height: 36,
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        borderRadius: 10,
        color: 'var(--ink)',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <SunIcon size={16} />
    </button>
  )
}
