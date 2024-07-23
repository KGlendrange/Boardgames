import React, { useState } from "react";
import { BASE_KEY } from "../App";

export function CreateLobby({ peer, createPeer }) {
  const [input, setInput] = useState(null);

  const key = input ? input + BASE_KEY : crypto.randomUUID();

  const link = lobbyLink(peer?.id);

  function handleCreate() {
    if (input !== "") {
      createPeer(key);
    }
  }
  return (
    <div className="create-lobby">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleCreate();
          }
        }}
      />
      <button onClick={() => handleCreate()}>Create lobby</button>
      {peer?.id && (
        <div>
          <input style={{ width: "100%" }} readOnly value={link} />
        </div>
      )}
    </div>
  );
}

export function lobbyLink(input) {
  if (!input) {
    return null;
  }
  const BASE = `${window.location.origin}${window.location.pathname}`;
  if (input.includes(BASE)) {
    return input;
  }
  return `${BASE}?id=${input}`;
}
