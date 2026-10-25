import { useState } from "react";

// Placeholder island to prove hydration works; replace with the footer island.
export default function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button type="button" onClick={() => setCount((c) => c + 1)}>
      Clicked {count} times
    </button>
  );
}
