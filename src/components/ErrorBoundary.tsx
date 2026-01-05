import React, { Component } from 'react';
import type { ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div style={{
                    width: '100vw',
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#0a0a0a',
                    color: 'white',
                    fontFamily: 'Inter, sans-serif',
                    padding: '20px',
                    boxSizing: 'border-box'
                }}>
                    <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️ Something went wrong</h1>
                    <p style={{ fontSize: '1rem', opacity: 0.7, textAlign: 'center', maxWidth: '600px' }}>
                        The orbit simulator encountered an error. This might be due to:
                    </p>
                    <ul style={{ textAlign: 'left', opacity: 0.7, marginTop: '1rem' }}>
                        <li>WebGL not being supported on your device</li>
                        <li>Insufficient memory or GPU resources</li>
                        <li>A rendering error with visual effects</li>
                    </ul>
                    <div style={{
                        marginTop: '2rem',
                        padding: '1rem',
                        background: 'rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        maxWidth: '800px',
                        overflow: 'auto',
                        fontSize: '0.9rem',
                        fontFamily: 'monospace'
                    }}>
                        <strong>Error details:</strong>
                        <pre style={{ margin: '0.5rem 0', whiteSpace: 'pre-wrap' }}>
                            {this.state.error?.message || 'Unknown error'}
                        </pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '2rem',
                            padding: '12px 24px',
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '1rem',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        Reload Page
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
