import React, { useEffect, useState } from 'react';

const TestPage = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/test/")
      .then(res => res.json())
      .then(json => setData(json))
      .catch(err => console.error("Fetch error:", err));
  }, []);

  return (
    <div>
      <h1>Test API Page</h1>
      {data ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <p>Loading data from Django...</p>
      )}
    </div>
  );
};

export default TestPage;
