import * as React from "react"

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = "", ...props }, ref) => (
    <label
      ref={ref}
      className={`text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 ${className}`}
      {...props}
    />
  )
)
Label.displayName = "Label"

export { Label }
