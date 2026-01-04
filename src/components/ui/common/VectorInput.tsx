import React, { useState } from 'react';
import { Vector3 } from 'three';
import './VectorInput.css';

interface VectorInputProps {
    label: string;
    value: Vector3;
    onChange: (val: Vector3) => void;
    onCommit?: (start: Vector3, end: Vector3) => void;
}

export const VectorInput: React.FC<VectorInputProps> = ({ label, value, onChange, onCommit }) => {
    const [local, setLocal] = useState({ x: value.x, y: value.y, z: value.z });

    const [prevVal, setPrevVal] = useState({ x: value.x, y: value.y, z: value.z });

    if (value.x !== prevVal.x || value.y !== prevVal.y || value.z !== prevVal.z) {
        const newVal = { x: value.x, y: value.y, z: value.z };
        setPrevVal(newVal);
        setLocal(newVal);
    }

    const handleChange = (axis: 'x' | 'y' | 'z', val: string) => {
        const num = parseFloat(val);
        const newLocal = { ...local, [axis]: isNaN(num) ? local[axis] : num };
        setLocal(newLocal);
    };

    const commit = () => {
        const newVec = new Vector3(local.x, local.y, local.z);
        if (!newVec.equals(value)) {
            if (onCommit) onCommit(value.clone(), newVec);
            onChange(newVec);
        }
    };

    return (
        <div className="lab-field">
            <label className="lab-label" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
            <div className="lab-vector-grid">
                {(['x', 'y', 'z'] as const).map(axis => (
                    <div key={axis} className="lab-vector-field">
                        <span className="lab-vector-label">{axis}</span>
                        <input
                            type="number"
                            value={local[axis]}
                            onChange={(e) => handleChange(axis, e.target.value)}
                            onBlur={commit}
                            onKeyDown={(e) => e.key === 'Enter' && commit()}
                            className="lab-vector-input"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
