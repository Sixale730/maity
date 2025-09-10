import React, { useEffect } from 'react';

const Registration = () => {
  useEffect(() => {
    // Load Tally script
    const script = document.createElement('script');
    script.src = 'https://tally.so/widgets/embed.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://tally.so/widgets/embed.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <style>
        {`
          html { margin: 0; height: 100%; overflow: hidden; }
          iframe { position: absolute; top: 0; right: 0; bottom: 0; left: 0; border: 0; }
        `}
      </style>
      <iframe 
        data-tally-src="https://tally.so/r/wQGAyA?transparentBackground=1" 
        width="100%" 
        height="100%" 
        frameBorder="0" 
        marginHeight={0} 
        marginWidth={0} 
        title="Registro"
        className="absolute inset-0 border-0"
      />
    </div>
  );
};

export default Registration;