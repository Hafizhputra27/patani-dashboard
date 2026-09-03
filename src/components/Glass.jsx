export default function Glass({ as: As = 'div', tone = 'default', className = '', children, ...rest }) {
  const cls = ['glass', tone !== 'default' && `glass--${tone}`, className].filter(Boolean).join(' ')
  return <As className={cls} {...rest}>{children}</As>
}
