/**
 * usePersistedState - A reusable hook for persisting state in localStorage
 * 
 * Features:
 * - Persists state across page refreshes
 * - Supports any serializable value (strings, numbers, objects, arrays)
 * - Optional expiration time
 * - Namespace support for organizing keys
 * - SSR safe (checks for window)
 * 
 * Usage Examples:
 * 
 * // Simple usage - persist active tab
 * const [activeTab, setActiveTab] = usePersistedState('dashboard-tab', 'overview');
 * 
 * // With namespace
 * const [activeTab, setActiveTab] = usePersistedState('activeTab', 'overview', { 
 *   namespace: 'unisync360-dashboard' 
 * });
 * 
 * // With expiration (1 hour)
 * const [filters, setFilters] = usePersistedState('filters', {}, { 
 *   expiresIn: 3600000 
 * });
 * 
 * // For accordion/collapse states
 * const [openSections, setOpenSections] = usePersistedState('openSections', ['section1'], {
 *   namespace: 'settings-page'
 * });
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_PREFIX = 'erp360_ui_state_';

/**
 * Get the full storage key with prefix and optional namespace
 */
const getStorageKey = (key, namespace) => {
    const baseKey = namespace ? `${namespace}_${key}` : key;
    return `${STORAGE_PREFIX}${baseKey}`;
};

/**
 * Safely parse JSON with fallback
 */
const safeJSONParse = (value, fallback) => {
    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

/**
 * Check if stored value has expired
 */
const isExpired = (storedData) => {
    if (!storedData || !storedData._expiresAt) return false;
    return Date.now() > storedData._expiresAt;
};

/**
 * Custom hook for persisting state in localStorage
 * 
 * @param {string} key - Unique key for the state
 * @param {any} defaultValue - Default value if nothing is stored
 * @param {object} options - Configuration options
 * @param {string} options.namespace - Optional namespace to group related states
 * @param {number} options.expiresIn - Optional expiration time in milliseconds
 * @returns {[any, Function, Function]} - [state, setState, clearState]
 */
export const usePersistedState = (key, defaultValue, options = {}) => {
    const { namespace, expiresIn } = options;
    const storageKey = getStorageKey(key, namespace);

    // Initialize state from localStorage or use default
    const [state, setState] = useState(() => {
        if (typeof window === 'undefined') return defaultValue;

        try {
            const storedValue = localStorage.getItem(storageKey);
            if (storedValue === null) return defaultValue;

            const parsed = safeJSONParse(storedValue, null);
            
            // Check for wrapped value with expiration
            if (parsed && typeof parsed === 'object' && '_value' in parsed) {
                if (isExpired(parsed)) {
                    localStorage.removeItem(storageKey);
                    return defaultValue;
                }
                return parsed._value;
            }

            return parsed !== null ? parsed : defaultValue;
        } catch (error) {
            console.warn(`usePersistedState: Error reading "${storageKey}"`, error);
            return defaultValue;
        }
    });

    // Update localStorage when state changes
    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const valueToStore = expiresIn
                ? { _value: state, _expiresAt: Date.now() + expiresIn }
                : state;

            localStorage.setItem(storageKey, JSON.stringify(valueToStore));
        } catch (error) {
            console.warn(`usePersistedState: Error saving "${storageKey}"`, error);
        }
    }, [state, storageKey, expiresIn]);

    // Clear the persisted state
    const clearState = useCallback(() => {
        if (typeof window === 'undefined') return;
        
        try {
            localStorage.removeItem(storageKey);
            setState(defaultValue);
        } catch (error) {
            console.warn(`usePersistedState: Error clearing "${storageKey}"`, error);
        }
    }, [storageKey, defaultValue]);

    return [state, setState, clearState];
};

/**
 * Hook specifically for managing active tab state
 * 
 * @param {string} pageId - Unique identifier for the page
 * @param {string} defaultTab - Default tab to show
 * @returns {[string, Function]} - [activeTab, setActiveTab]
 */
export const useActiveTab = (pageId, defaultTab = '') => {
    return usePersistedState('activeTab', defaultTab, { namespace: pageId });
};

/**
 * Hook for managing multiple open/closed accordion sections
 * 
 * @param {string} pageId - Unique identifier for the page
 * @param {string[]} defaultOpen - Array of section IDs that should be open by default
 * @returns {object} - { openSections, toggleSection, isOpen, openAll, closeAll }
 */
export const useAccordionState = (pageId, defaultOpen = []) => {
    const [openSections, setOpenSections] = usePersistedState(
        'accordionState', 
        defaultOpen, 
        { namespace: pageId }
    );

    const toggleSection = useCallback((sectionId) => {
        setOpenSections(prev => {
            const isCurrentlyOpen = prev.includes(sectionId);
            if (isCurrentlyOpen) {
                return prev.filter(id => id !== sectionId);
            } else {
                return [...prev, sectionId];
            }
        });
    }, [setOpenSections]);

    const isOpen = useCallback((sectionId) => {
        return openSections.includes(sectionId);
    }, [openSections]);

    const openAll = useCallback((sectionIds) => {
        setOpenSections(sectionIds);
    }, [setOpenSections]);

    const closeAll = useCallback(() => {
        setOpenSections([]);
    }, [setOpenSections]);

    return { openSections, toggleSection, isOpen, openAll, closeAll };
};

/**
 * Hook for managing a single collapsible element
 * 
 * @param {string} elementId - Unique identifier for the element
 * @param {boolean} defaultOpen - Whether the element should be open by default
 * @returns {[boolean, Function]} - [isOpen, toggle]
 */
export const useCollapsible = (elementId, defaultOpen = false) => {
    const [isOpen, setIsOpen] = usePersistedState(
        `collapse_${elementId}`, 
        defaultOpen
    );

    const toggle = useCallback(() => {
        setIsOpen(prev => !prev);
    }, [setIsOpen]);

    return [isOpen, toggle, setIsOpen];
};

/**
 * Utility function to clear all persisted UI states
 * Useful for logout or reset scenarios
 */
export const clearAllPersistedUIState = () => {
    if (typeof window === 'undefined') return;

    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(STORAGE_PREFIX)) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
};

export default usePersistedState;
