import { useState } from 'react';
import { HelpCircle, Plus, Minus } from 'lucide-react';
import { FadeIn } from '../shared/FadeIn';
import { LANDING_FAQS } from '../../constants/faq-data';

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div id="faq-section" className="py-24 bg-[#0F0F0F] border-t border-white/5 text-[#e7e7e9]">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-16">
          <FadeIn>
            <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-full mb-4">
              <HelpCircle size={24} className="text-gray-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Preguntas Frecuentes</h2>
            <p className="text-gray-500">Todo lo que necesitas saber para empezar tu evolución.</p>
          </FadeIn>
        </div>
        <div className="space-y-4">
          {LANDING_FAQS.map((faq, index) => (
            <FadeIn key={index} delay={index * 50}>
              <div
                className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                  openIndex === index
                    ? 'bg-[#141414] border-pink-500/50 shadow-lg shadow-pink-900/10'
                    : 'bg-[#0A0A0A] border-white/10 hover:border-white/20'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex justify-between items-center p-5 text-left focus:outline-none"
                >
                  <span className={`font-medium text-lg ${openIndex === index ? 'text-white' : 'text-gray-300'}`}>
                    {faq.q}
                  </span>
                  <div className={`p-1 rounded-full transition-colors ${openIndex === index ? 'bg-pink-500 text-white' : 'text-gray-500'}`}>
                    {openIndex === index ? <Minus size={16} /> : <Plus size={16} />}
                  </div>
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out ${
                    openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-5 pt-0 text-gray-400 leading-relaxed border-t border-white/5 mt-2">
                    {faq.a}
                  </div>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
};
