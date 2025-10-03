import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../../styles/components/customCursor.module.scss';




const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e: MouseEvent) => {
      if (
        e.target instanceof HTMLElement &&
        e.target.closest('a, button, [role="button"], .hotspot, .carouselButton, .thumbnailButton, .navLink')
      ) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      if (
        e.target instanceof HTMLElement &&
        e.target.closest('a, button, [role="button"], .hotspot, .carouselButton, .thumbnailButton, .navLink')
      ) {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
    };
  }, []);

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  if (isTouchDevice) return null;

  return (
    <motion.div
      ref={cursorRef}
      className={`${styles.customCursor} ${isHovering ? styles.hover : ''}`}
      style={{ x: position.x - 10, y: position.y - 10 }}
      animate={{
        scale: isHovering ? 1.5 : 1,
        opacity: isHovering ? 0.9 : 0.7,
      }}
      transition={{ ease: 'easeOut', duration: 0.2 }}
    />
  );
};

export default CustomCursor;

