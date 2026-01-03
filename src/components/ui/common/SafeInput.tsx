import React, { useState, useEffect } from 'react';

interface SafeInputProps {
    value: number;
    onChange: (value: number) => void;
    onCommit?: (start: number, end: number) => void;
    min?: number;
    max?: number;
    step?: number;
    className?: string;
    style?: React.CSSProperties;
    placeholder?: string;
}

export const SafeInput: React.FC<SafeInputProps> = ({
    value,
    onChange,
    onCommit,
    min,
    max,
    className,
    style,
    placeholder
}) => {
    const [inputValue, setInputValue] = useState(value.toString());
    const [error, setError] = useState<string | null>(null);

    const [startValue, setStartValue] = useState<number | null>(null);

    // Sync with external value changes
    useEffect(() => {
        setInputValue(value.toString());
        setError(null);
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setInputValue(newValue);

        const parsed = parseFloat(newValue);

        if (newValue === '' || newValue === '-') {
            // Allow temporary empty or negative sign state
            return;
        }

        if (isNaN(parsed)) {
            setError('Invalid number');
            return;
        }

        if (min !== undefined && parsed < min) {
            setError(`Min: ${min}`);
            return;
        }

        if (max !== undefined && parsed > max) {
            setError(`Max: ${max}`);
            return;
        }

        setError(null);
        onChange(parsed);
    };

    const handleFocus = () => {
        setStartValue(value);
    };

    const handleBlur = () => {
        // Reset to valid value on blur if invalid
        if (error || inputValue === '' || inputValue === '-') {
            setInputValue(value.toString());
            setError(null);
        } else if (onCommit && startValue !== null) {
            onCommit(startValue, parseFloat(inputValue));
        }
        setStartValue(null);
    };

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            <input
                type="text" // Use text to allow fuller control over input (e.g. preventing 'e')
                value={inputValue}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                className={className}
                style={{
                    ...style,
                    borderColor: error ? '#ef4444' : style?.borderColor
                }}
                placeholder={placeholder}
            />
            {error && (
                <div style={{
                    position: 'absolute',
                    right: 0,
                    top: '-18px',
                    fontSize: '0.7rem',
                    color: '#ef4444',
                    background: 'rgba(0,0,0,0.8)',
                    padding: '1px 4px',
                    borderRadius: '2px',
                    zIndex: 10
                }}>
                    {error}
                </div>
            )}
        </div>
    );
};
