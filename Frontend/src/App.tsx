import { Toaster } from 'react-hot-toast';
import { AppRouter } from '@/routes/AppRouter';
// import { MockAuthToggle } from '@/components/dev/MockAuthToggle';
import { useThemeStore } from '@/store';
import { useEffect } from 'react';

function App() {
  const isDev = import.meta.env.DEV;
  const initTheme = useThemeStore((state) => state.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <>
      <AppRouter />
      {/* {isDev && <MockAuthToggle />} */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#111827',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            fontSize: '14px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

export default App;
