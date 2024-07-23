import React, { useState } from "react";

export function CreateName({ name, setName }) {
  const [input, setInput] = useState(name);
  return (
    <div className="create-name">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && input !== "") {
            setName(input);
          }
        }}
      />
      <button onClick={() => setName(input)}>Create name</button>
    </div>
  );
}
