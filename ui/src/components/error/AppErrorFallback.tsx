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

function AppErrorFallback({ error }: ErrorFallbackProps) {
  return (
    <div className="error-container">
      <h2>{`${translations.en.errorTitle} / ${translations.fr.errorTitle}`}</h2>
      <div className="error-advice">
        <div>{translations.en.errorAdvice}</div>
        <div>{translations.fr.errorAdvice}</div>
      </div>
      <div className="error-message">{error.message}</div>
      <a href="/" className="home-button">
        {`${translations.en.goToHome} / ${translations.fr.goToHome}`}
      </a>
    </div>
  );
}

export default AppErrorFallback;
