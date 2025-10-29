import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function Portal({ children, target = 'portal-root' }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Create portal root if it doesn't exist
    let portalRoot = document.getElementById(target);
    if (!portalRoot) {
      portalRoot = document.createElement('div');
      portalRoot.id = target;
      portalRoot.style.position = 'relative';
      portalRoot.style.zIndex = '999999';
      document.body.appendChild(portalRoot);
    }
    
    setMounted(true);

    return () => {
      // Cleanup: remove portal root if it's empty
      const existingPortalRoot = document.getElementById(target);
      if (existingPortalRoot && existingPortalRoot.children.length === 0) {
        document.body.removeChild(existingPortalRoot);
      }
    };
  }, [target]);

  if (!mounted) return null;

  const portalRoot = document.getElementById(target);
  return portalRoot ? createPortal(children, portalRoot) : null;
}