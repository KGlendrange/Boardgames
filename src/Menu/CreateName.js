import React, { useState } from "react";

export function CreateName({ name, setName }) {
  const [input, setInput] = useState(name);

  function handleName() {
    if (input !== "") {
      setName(input);
      localStorage.setItem("name", input);
    }
  }
  return (
    <div className="create-name">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && input !== "") {
            handleName();
          }
        }}
      />
      <button onClick={() => handleName()}>Create name</button>
    </div>
  );
}
