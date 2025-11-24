import { RouterProvider } from 'react-router-dom';
import { router } from './routes';
import './App.css';

function App(): JSX.Element {
  return <RouterProvider router={router} />;
}

export default App;
