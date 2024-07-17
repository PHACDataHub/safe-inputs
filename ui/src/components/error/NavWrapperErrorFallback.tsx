import { Trans } from '@lingui/macro';
import './index.css';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

function NavWrapperErrorFallBack({ error }: ErrorFallbackProps) {
  return (
    <div className="error-container">
      <div className="error-title">
        <Trans>Something went wrong</Trans>
      </div>
      <div>
        <Trans>Please contact the developers or go to the home page.</Trans>
      </div>
      <div className="error-message">{error.message}</div>
      <a href="/">
        <button className="home-button">
          <Trans>Go to Home</Trans>
        </button>
      </a>
    </div>
  );
}

export default NavWrapperErrorFallBack;
