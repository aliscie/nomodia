import { useEffect, useState } from 'react';
import rustLogo from './assets/rust.svg';
import reactLogo from './assets/react.svg';
import { backend } from '@/declarations/backend';
import { useBackendContext } from '@/utils/backendContext';

function HomePage() {
  const { login, logout, backendActor } = useBackendContext();
  const [count, setCount] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);

  // Get the current counter value
  const fetchCount = async () => {
    try {
      setLoading(true);
      const count = await backendActor.get();
      console.log({ count });
      // setCount(+count.toString()); // Convert BigInt to number
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch the count on page load
  useEffect(() => {
    fetchCount();
  }, []);

  return <div className="App">sxx</div>;
}

export default HomePage;
