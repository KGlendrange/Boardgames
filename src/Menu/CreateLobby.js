import React, { useState } from "react";
import { BASE_KEY } from "../App";

export function CreateLobby({ createPeer }) {
  const [input, setInput] = useState(null);

  const link =
    window.location.origin +
    window.location.pathname +
    "?id=" +
    (input ? input + BASE_KEY : crypto.randomUUID());

  return (
    <div className="create-lobby">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && input !== "") {
            createPeer(input);
          }
        }}
      />
      <button onClick={() => createPeer(input)}>Create lobby</button>
      <div>
        <input style={{ width: "100%" }} readOnly value={link} />
      </div>
    </div>
  );
}
