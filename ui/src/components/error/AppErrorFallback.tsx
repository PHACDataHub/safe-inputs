import { useState } from 'react';
import './index.css';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

type Language = 'en' | 'fr';
type TranslationKey = 'errorTitle' | 'errorAdvice' | 'goToHome';

const translations: Record<Language, Record<TranslationKey, string>> = {
  en: {
    errorTitle: 'The application crashed unexpectedly',
    errorAdvice: 'Please contact the developers or go to the home page.',
    goToHome: 'Go to Home',
  },
  fr: {
    errorTitle: "L'application a planté de manière inattendue",
    errorAdvice:
      "Veuillez contacter les développeurs ou aller à la page d'accueil.",
    goToHome: "Aller à l'accueil",
  },
};

const translate = (key: TranslationKey, language: Language): string => {
  return translations[language][key] || key;
};

function AppErrorFallback({ error }: ErrorFallbackProps) {
  const [language, setLanguage] = useState<Language>('en');

  const buttonText = language === 'en' ? 'Fr' : 'En';

  return (
    <div className="error-container">
      <button
        className="language-button"
        onClick={() => setLanguage(buttonText.toLowerCase() as Language)}
      >
        {buttonText}
      </button>
      <div className="error-title">{translate('errorTitle', language)}</div>
      <div>{translate('errorAdvice', language)}</div>
      <div className="error-message">{error.message}</div>
      <a href="/">
        <button className="home-button">
          {translate('goToHome', language)}
        </button>
      </a>
    </div>
  );
}

export default AppErrorFallback;
