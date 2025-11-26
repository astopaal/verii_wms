import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import { LanguageSwitcher } from './components/shared/LanguageSwitcher';
import './App.css';

function App(): JSX.Element {
  return (
    <>
      <RouterProvider router={router} />
      <LanguageSwitcher />
    </>
  );
}

export default App;
