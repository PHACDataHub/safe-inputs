import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Routes, Route, MemoryRouter } from 'react-router-dom';

import NavWrapper from 'src/pages/NavWrapper.tsx';
import { TestProviders } from 'src/test_utils/TestProviders.tsx';

jest.mock('src/components/auth/AuthNavButton.tsx', () => {
  const MockAuthNavButton = () => <div>Button</div>;
  return MockAuthNavButton;
});

describe('NavWrapper', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders header, footer, and outlet without error', () => {
    const { container } = render(
      <TestProviders i18n_lang="en">
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<NavWrapper />}>
              <Route
                index
                element={<div data-testid="outlet-content">Fake element</div>}
              />
            </Route>
          </Routes>
        </MemoryRouter>
      </TestProviders>,
    );
    expect(container.querySelectorAll('header')).toHaveLength(1);
    expect(screen.getByTestId('outlet-content')).toBeInTheDocument();
    expect(container.querySelectorAll('footer')).toHaveLength(1);
  });

  test('renders Error fallback component', () => {
    const error_to_throw = new Error('Component failure');
    const ThrowsError = () => {
      throw error_to_throw;
    };

    // Using a spy to silence console output for the expected errors, to keep the test logs readable.
    // This may introduce some britleness to the test, but it's worth it for quality test output
    const console_error_original = console.error;
    const console_error_spy = jest.spyOn(console, 'error');
    console_error_spy.mockImplementation((error) => {
      if (
        !error.message.includes('<ThrowsError> component') &&
        !error.message.includes('Uncaught [Error: Component failure]')
      ) {
        console_error_original(error);
      }
    });

    render(
      <TestProviders>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route path="/" element={<NavWrapper />}>
              <Route index element={<ThrowsError />} />
            </Route>
          </Routes>
        </MemoryRouter>
        ,
      </TestProviders>,
    );

    console_error_spy.mockRestore();

    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent(/.+/);

    const errorMessage = screen.getByText(error_to_throw.message);

    expect(errorMessage).toBeInTheDocument();
  });
});
