import React, {useEffect, useState} from 'react';

const WebcamStream = () => {
  return (
    <div className="webcam-container">
      <h2>Live Webcam Feed</h2>
      <img
        src="http://localhost:8000/video-feed/"
        alt="Live stream"
        style={{ width: '640px', borderRadius: '8px', border: '2px solid #888' }}
      />
    </div>
  );
};

const TestAPI = () => {
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
export default WebcamStream;
export { TestAPI };
