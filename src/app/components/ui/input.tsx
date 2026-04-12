    'use client';
    import { InputHTMLAttributes } from 'react';

    interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    required?: boolean;
    hint?: string;
    }

    export default function Input({ label, required, hint, ...props }: InputProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {label && (
            <label style={{ fontSize: 13, fontWeight: 500, color: '#666' }}>
            {label} {required && <span style={{ color: 'red' }}>*</span>}
            </label>
        )}
        <input
            style={{
            height: 36,
            border: '1px solid #ddd',
            borderRadius: 8,
            padding: '0 10px',
            fontSize: 14,
            width: '100%',
            }}
            {...props}
        />
        {hint && <span style={{ fontSize: 11, color: '#aaa' }}>{hint}</span>}
        </div>
    );
    }