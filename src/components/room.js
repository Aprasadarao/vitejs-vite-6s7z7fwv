import { useState, useEffect } from 'react';
import { createConnection } from './chat.js';
import { useRef, useImperativeHandle } from 'react';
import { useRef } from 'react';
import Post from './Post.js';
import { useInsertionEffect } from 'react';
import { useState, useRef, useLayoutEffect } from 'react';


function ChatRoom({ roomId }) {
  const [serverUrl, setServerUrl] = useState('https://localhost:1234');

  useEffect(() => {
    const connection = createConnection(serverUrl, roomId);
    connection.connect();
    return () => {
      connection.disconnect();
    };
  }, [serverUrl, roomId]);
  // ...
}



function chat({roomNO}) {
    const [serverUrl, setServerUrl] = useState('https:///use-such-no-url');
    useEffect(() => {
        const connection = createConnection(serverUrl, roomID);
        connection.connect();
        return () => {
            connection.disconnect();
        };
        }, [serverUrl, roomId]);
    
}


function MyInput({ ref }) {
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => {
    return {
      focus() {
        inputRef.current.focus();
      },
      scrollIntoView() {
        inputRef.current.scrollIntoView();
      },
    };
  }, []);

  return <input ref={inputRef} />;
};



export default function Page() {
  const postRef = useRef(null);

  function handleClick() {
    postRef.current.scrollAndFocusAddComment();
  }

  return (
    <>
      <button onClick={handleClick}>
        Write a comment
      </button>
      <Post ref={postRef} />
    </>
  );
}


// Inside your CSS-in-JS library
function useCss(rule) {
  useInsertionEffect(() => {
    // ... inject <style> tags here ...
  });
  return rule;
}


function Tooltip() {
  const ref = useRef(null);
  const [tooltipHeight, setTooltipHeight] = useState(0);

  useLayoutEffect(() => {
    const { height } = ref.current.getBoundingClientRect();
    setTooltipHeight(height);
  }, []);
  // ...
}
