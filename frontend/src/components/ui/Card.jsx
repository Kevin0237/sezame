export function Card({ children, className = '', as: Comp = 'div', ...props }) {
  return (
    <Comp
      className={`bg-surface border border-border rounded-md shadow-soft ${className}`}
      {...props}
    >
      {children}
    </Comp>
  )
}
