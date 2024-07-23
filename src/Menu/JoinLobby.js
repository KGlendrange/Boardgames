import React, { useState } from "react";
import { lobbyLink } from "./CreateLobby";

export function JoinLobby({ name }) {
  const [input, setInput] = useState(null);

  function handleJoin() {
    if (input !== "") {
      //navigate to the url
      window.location.href = lobbyLink(input);
    }
  }

  return (
    <div className="join-lobby">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleJoin();
          }
        }}
      />
      <button onClick={() => handleJoin()}>Join lobby</button>
    </div>
  );
}
