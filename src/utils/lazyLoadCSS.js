/**
 * Lazy load CSS files only when needed (e.g., for specific routes)
 * @param {string} href - Path to CSS file
 * @param {string} id - Unique ID for the link element
 */
export const lazyLoadCSS = (href, id) => {
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
};

/**
 * Unload CSS file from DOM (useful for cleaning up unused routes)
 * @param {string} id - ID of the link element to remove
 */
export const unloadCSS = (id) => {
  const link = document.getElementById(id);
  if (link) {
    link.remove();
  }
};
