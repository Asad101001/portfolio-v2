import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to handle typewriter effects
 * @param phrases List of phrases to type
 * @param typeSpeed Speed of typing (ms per char)
 * @param deleteSpeed Speed of deleting (ms per char)
 * @param pause Pause duration between phrases (ms)
 * @returns { typedText: string, isDeleting: boolean }
 */
export function useTypewriter(
  phrases: string[], 
  typeSpeed: number = 75, 
  deleteSpeed: number = 40, 
  pause: number = 2000
) {
  const [typedText, setTypedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);

  const tick = useCallback(() => {
    const currentPhrase = phrases[phraseIndex];
    if (!currentPhrase) return;

    if (isDeleting) {
      setTypedText(currentPhrase.substring(0, typedText.length - 1));
      if (typedText === '') {
        setIsDeleting(false);
        setPhraseIndex((prev: number) => (prev + 1) % phrases.length);
      }
    } else {
      setTypedText(currentPhrase.substring(0, typedText.length + 1));
      if (typedText === currentPhrase) {
        setTimeout(() => setIsDeleting(true), pause);
      }
    }
  }, [phrases, phraseIndex, typedText, isDeleting, pause]);

  useEffect(() => {
    const timer = setTimeout(
      tick, 
      isDeleting ? deleteSpeed : typeSpeed
    );
    return () => clearTimeout(timer);
  }, [tick, isDeleting, typeSpeed, deleteSpeed]);

  return { typedText, isDeleting };
}
