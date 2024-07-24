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
  if (peer?.id) {
    try {
      navigator.clipboard.writeText(link);
    } catch (e) {
      console.error("Failed to copy to clipboard: ", e);
    }
  }
  return (
    <div className="create-lobby">
      <input
        value={input}
        placeholder="Name of lobby"
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleCreate();
          }
        }}
      />
      <button onClick={() => handleCreate()}>Create lobby</button>
      {peer?.id && (
        <div style={{ marginTop: "24px" }}>
          Give this link to your friend:
          <input
            style={{ width: "100%", minWidth: "280px" }}
            readOnly
            value={link}
          />
          <span style={{ color: "green" }}>
            The link should be added to your clipboard
          </span>
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
