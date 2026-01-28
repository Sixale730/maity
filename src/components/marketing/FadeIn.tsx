import { useEffect, useRef, useState } from 'react';
import type { FadeInProps } from './marketing.constants';

export const FadeIn = ({ children, delay = 0, className = "" }: FadeInProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      });
    });
    const currentElement = domRef.current;
    if (currentElement) observer.observe(currentElement);
    return () => {
      if (currentElement) observer.unobserve(currentElement);
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default FadeIn;
