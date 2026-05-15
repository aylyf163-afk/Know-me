import { useState } from 'react'
import './BB8Toggle.css'

interface BB8ToggleProps {
  defaultChecked?: boolean
  checked?: boolean
  onChange?: (checked: boolean) => void
  size?: number
}

export default function BB8Toggle({
  defaultChecked = false,
  checked,
  onChange,
  size = 16,
}: BB8ToggleProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked)
  const isControlled = checked !== undefined
  const isChecked = isControlled ? checked : internalChecked

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternalChecked(e.target.checked)
    onChange?.(e.target.checked)
  }

  return (
    <label className="bb8-toggle" style={{ '--toggle-size': `${size}px` } as React.CSSProperties}>
      <input
        className="bb8-toggle__checkbox"
        type="checkbox"
        checked={isChecked}
        onChange={handleChange}
      />
      <div className="bb8-toggle__container">
        <div className="bb8-toggle__scenery">
          <div className="bb8-toggle__star" />
          <div className="bb8-toggle__star" />
          <div className="bb8-toggle__star" />
          <div className="bb8-toggle__star" />
          <div className="bb8-toggle__star" />
          <div className="bb8-toggle__star" />
          <div className="bb8-toggle__star" />
          <div className="tatto-1" />
          <div className="tatto-2" />
          <div className="gomrassen" />
          <div className="hermes" />
          <div className="chenini" />
          <div className="bb8-toggle__cloud" />
          <div className="bb8-toggle__cloud" />
          <div className="bb8-toggle__cloud" />
        </div>
        <div className="bb8">
          <div className="bb8__head-container">
            <div className="bb8__antenna" />
            <div className="bb8__antenna" />
            <div className="bb8__head" />
          </div>
          <div className="bb8__body" />
        </div>
        <div className="artificial__hidden">
          <div className="bb8__shadow" />
        </div>
      </div>
    </label>
  )
}
