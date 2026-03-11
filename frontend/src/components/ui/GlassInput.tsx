import { forwardRef, InputHTMLAttributes } from 'react'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const GlassInput = forwardRef<HTMLInputElement, Props>(
  ({ label, error, icon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && !props.placeholder && (
          <label className="block text-sm mb-1.5 font-body" style={{ color: 'var(--text-secondary)' }}>
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'var(--text-muted)' }}>
              {icon}
            </div>
          )}
          <input
            ref={ref}
            {...props}
            placeholder={props.placeholder ?? label ?? ''}
            className={`glass-input w-full px-4 py-3 font-body text-sm ${icon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} ${error ? 'border-red-500/50' : ''} ${className}`}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: 'var(--text-muted)' }}>
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs" style={{ color: '#ff1744' }}>{error}</p>
        )}
      </div>
    )
  }
)

GlassInput.displayName = 'GlassInput'
export default GlassInput
