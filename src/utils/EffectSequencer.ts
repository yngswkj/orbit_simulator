/**
 * EffectSequencer.ts
 * Reliable timing system for complex effect sequences
 * Uses requestAnimationFrame instead of setTimeout for precise timing
 */

export interface SequenceAction {
    time: number; // Time in ms from sequence start
    action: () => void;
    executed?: boolean;
}

export class EffectSequencer {
    private startTime: number = 0;
    private sequence: SequenceAction[] = [];
    private isRunning: boolean = false;
    private rafId: number | null = null;

    constructor(sequence: SequenceAction[]) {
        this.sequence = sequence.map(item => ({ ...item, executed: false }));
    }

    /**
     * Start the sequence
     */
    start(): void {
        if (this.isRunning) {
            console.warn('EffectSequencer: Sequence already running');
            return;
        }

        this.startTime = performance.now();
        this.isRunning = true;
        this.tick();
    }

    /**
     * Stop the sequence
     */
    stop(): void {
        this.isRunning = false;
        if (this.rafId !== null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }

    /**
     * Reset the sequence (allows restart)
     */
    reset(): void {
        this.stop();
        this.sequence.forEach(item => {
            item.executed = false;
        });
    }

    /**
     * Main tick function using requestAnimationFrame
     */
    private tick = (): void => {
        if (!this.isRunning) return;

        const elapsed = performance.now() - this.startTime;

        // Execute all actions whose time has come
        this.sequence.forEach(item => {
            if (!item.executed && elapsed >= item.time) {
                try {
                    item.action();
                    item.executed = true;
                } catch (error) {
                    console.error('EffectSequencer: Action execution error', error);
                    item.executed = true; // Mark as executed to avoid repeated errors
                }
            }
        });

        // Check if all actions have been executed
        const allExecuted = this.sequence.every(item => item.executed);
        if (allExecuted) {
            this.stop();
            return;
        }

        // Schedule next tick
        this.rafId = requestAnimationFrame(this.tick);
    };

    /**
     * Get progress (0.0 - 1.0)
     */
    getProgress(): number {
        if (this.sequence.length === 0) return 1;

        const maxTime = Math.max(...this.sequence.map(item => item.time));
        const elapsed = performance.now() - this.startTime;
        return Math.min(elapsed / maxTime, 1);
    }

    /**
     * Check if sequence is running
     */
    isActive(): boolean {
        return this.isRunning;
    }
}

/**
 * Helper function to create a sequence
 */
export function createSequence(actions: Array<{ delay: number; action: () => void }>): SequenceAction[] {
    return actions.map(({ delay, action }) => ({
        time: delay,
        action
    }));
}
