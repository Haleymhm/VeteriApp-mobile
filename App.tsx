// Slot root del router. El contenido vive en app/_layout.tsx.
import { Slot } from 'expo-router';
import './global.css';

export default function App() {
  return <Slot />;
}
