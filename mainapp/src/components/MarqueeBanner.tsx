import { useEffect, useRef } from 'react';
import { Sparkles, MessageCircle, Home, DollarSign, Zap } from 'lucide-react';

/**
 * MarqueeBanner Component
 * 
 * Displays a scrolling marquee banner for promotions and announcements.
 * Uses clean code principles with proper TypeScript typing and OOP structure.
 * Features Lucide React icons instead of emojis for professional appearance.
 * 
 * @returns {JSX.Element} The MarqueeBanner component
 */

interface MarqueeItem {
  id: number;
  text: string;
  Icon: React.ComponentType<{ className?: string }>;
}

export default function MarqueeBanner() {
  // Ref for the scrolling container
  const marqueeRef = useRef<HTMLDivElement>(null);

  // Promotional messages - easily configurable with Lucide icons
  const messages: MarqueeItem[] = [
    { id: 1, text: "Use VanguardCargo to get up to 80% off shipment fees", Icon: Sparkles },
    { id: 2, text: "Delivery in 3 business days", Icon: Zap },
    { id: 3, text: "Need help? Contact us we reply instantly!", Icon: MessageCircle },
    { id: 4, text: "Delivery to Ghana in 3 days", Icon: Home },
    { id: 5, text: "Save up to 80% on international shipping", Icon: DollarSign },
  ];

  /**
   * Initialize infinite scroll animation
   */
  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    // Clone the content for seamless loop
    const marqueeContent = marquee.querySelector('.marquee-content');
    if (marqueeContent) {
      const clone = marqueeContent.cloneNode(true) as HTMLElement;
      clone.setAttribute('aria-hidden', 'true');
      marquee.appendChild(clone);
    }
  }, []);

  return (
    <div className="w-full bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white overflow-hidden shadow-md border-b border-red-700 relative">
      {/* Animated stripe pattern overlay */}
      <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)]"></div>
      
      {/* Marquee container - increased padding for height */}
      <div 
        ref={marqueeRef}
        className="marquee-wrapper py-3.5 flex whitespace-nowrap relative z-10"
        role="region"
        aria-label="Promotional banner"
      >
        {/* Marquee content */}
        <div className="marquee-content flex items-center animate-marquee">
          {messages.map((message, index) => {
            const Icon = message.Icon;
            return (
              <div 
                key={`${message.id}-${index}`}
                className="flex items-center mx-8"
              >
                <span className="flex items-center gap-3">
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-base font-semibold drop-shadow-sm">{message.text}</span>
                </span>
                {/* Separator */}
                <span className="mx-8 text-white/60 text-lg">•</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gradient fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-red-600 to-transparent pointer-events-none z-20"></div>
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-red-600 to-transparent pointer-events-none z-20"></div>
    </div>
  );
}
