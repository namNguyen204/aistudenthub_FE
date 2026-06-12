import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './Input.css';

const Input = forwardRef(({
  label,
  type = 'text',
  error,
  required = false,
  placeholder = '',
  iconLeft,
  iconRight,
  className = '',
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const togglePassword = () => setShowPassword(!showPassword);

  const hasIconLeft = !!iconLeft;
  const hasIconRight = !!iconRight || isPassword;

  const fieldClasses = [
    'input-field',
    hasIconLeft ? 'has-icon-left' : '',
    hasIconRight ? 'has-icon-right' : '',
    error ? 'has-error' : '',
  ].filter(Boolean).join(' ');

  return (
    <div className={`input-container ${className}`}>
      {label && (
        <label className={`input-label ${required ? 'required' : ''}`}>
          {label}
        </label>
      )}
      
      <div className="input-wrapper">
        {iconLeft && (
          <span className="input-icon-left">
            {iconLeft}
          </span>
        )}

        <input
          ref={ref}
          type={inputType}
          className={fieldClasses}
          placeholder={placeholder}
          required={required}
          {...props}
        />

        {(iconRight || isPassword) && (
          <span className="input-icon-right">
            {isPassword ? (
              <button 
                type="button" 
                onClick={togglePassword} 
                className="btn-toggle-password"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            ) : (
              iconRight
            )}
          </span>
        )}
      </div>

      {error && <span className="input-error-msg">{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
