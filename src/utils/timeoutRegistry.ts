export interface TimeoutRegistry {
    schedule: (callback: () => void, delayMs: number) => ReturnType<typeof setTimeout>;
    clear: (timeoutId: ReturnType<typeof setTimeout>) => void;
    clearAll: () => void;
    size: () => number;
}

export const createTimeoutRegistry = (): TimeoutRegistry => {
    const timeouts = new Set<ReturnType<typeof setTimeout>>();

    return {
        schedule: (callback, delayMs) => {
            const timeoutId = setTimeout(() => {
                timeouts.delete(timeoutId);
                callback();
            }, delayMs);

            timeouts.add(timeoutId);
            return timeoutId;
        },

        clear: (timeoutId) => {
            clearTimeout(timeoutId);
            timeouts.delete(timeoutId);
        },

        clearAll: () => {
            for (const timeoutId of timeouts) {
                clearTimeout(timeoutId);
            }
            timeouts.clear();
        },

        size: () => timeouts.size
    };
};
