import React, { useState } from "react";

export function CreateLobby({ peer, createPeer }) {
  const [input, setInput] = useState(null);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);

  const key = input ? input : crypto.randomUUID();

  const link = lobbyLink(peer?.id);

  console.log("link: ", link);

  function handleCreate() {
    console.log("handle create", key);
    if (input === null || input?.trim() !== "") {
      console.log("whats sup");
      createPeer(key);
    }
  }

  return (
    <div className="create-lobby">
      {peer?.id ? (
        <div>
          Give this link to your friend:
          <input
            style={{ width: "100%", minWidth: "280px" }}
            readOnly
            value={link}
          />
          <button
            onClick={() => {
              try {
                navigator.clipboard.writeText(link);
                setCopiedToClipboard(true);
              } catch (e) {
                console.error(e);
              }
            }}
          >
            {copiedToClipboard ? "Copied!" : "Copy to clipboard"}
          </button>
        </div>
      ) : (
        <div>
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
        </div>
      )}
    </div>
  );
}

export function lobbyLink(input) {
  if (!input) {
    return null;
  }
  console.log(window.location);
  const BASE = window.location.origin;

  if (input.includes(BASE) && input.includes("lobby=")) {
    return input;
  }

  const gameRegex = window.location.href.match(/game=([^&]+)/);
  const gameMatch = gameRegex.length > 1 ? gameRegex[1] : undefined;
  const res = `${BASE}/${gameMatch ?? ""}?lobby=${input}`;
  console.log("res:", res);
  return res;
}
