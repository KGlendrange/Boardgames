import React, { useState, useEffect } from "react";

const colors = ["blue", "green", "purple", "orange", "teal", "maroon", "navy"];

//a chat app with your connection
export function Chat({ connection }) {
  const [minimize, setMinimize] = useState(false);
  const [name, setName] = useState(localStorage.getItem("name"));
  const [isChangingName, setIsChangingName] = useState(false);
  const displayName = name || "Guest";

  const [input, setInput] = useState("");
  const [texts, setTexts] = useState([
    {
      type: "chat",
      name: "System",
      text: "Welcome to the chat!",
      color: "red"
    }
  ]);

  const [mainColor] = useState(() => {
    const takenColors = texts.map((text) => text.color);
    const availableColors = colors.filter(
      (color) => !takenColors.includes(color)
    );
    return availableColors?.[0] || "navy";
  });

  function handleClick() {
    const newText = {
      type: "chat",
      name: displayName,
      text: input,
      color: mainColor
    };
    if (connection) {
      connection.send(newText);
    }

    setTexts([...texts, newText]);

    setInput(""); //clear input
  }

  useEffect(() => {
    if (connection) {
      connection.on("data", (data) => {
        if (data.type !== "chat") {
          return;
        }
        console.log("got some data in chat: ", data);
        setTexts((t) => [...t, data]);
      });
      connection.on("open", () => {
        setTexts((t) => [
          ...t,
          {
            type: "chat",
            name: "System",
            text: "Connection opened",
            color: "red"
          }
        ]);
      });
      connection.on("close", () => {
        console.log("connection closed");
        setTexts((t) => [
          ...t,
          {
            type: "chat",
            name: "System",
            text: "Connection closed",
            color: "red"
          }
        ]);
      });
    }
  }, [connection]);

  if (!connection) {
    return null;
  }
  return (
    <div className={`chat ${!minimize ? "chat--border" : "chat-minimize"}`}>
      <div>
        {!minimize && (
          <button onClick={() => setIsChangingName((prev) => !prev)}>
            Change name
          </button>
        )}
        <button
          className="minimize"
          onClick={() => setMinimize((prev) => !prev)}
        >
          {minimize ? "show chat" : "hide chat"}
        </button>
      </div>
      {isChangingName && (
        <div className="change-name">
          <group>
            <label htmlFor="namechange">Change name</label>
            <input
              id="namechange"
              onKeyDown={(e) => {
                console.log("keydown");
                if (e.key === "Enter") {
                  localStorage.setItem("name", e.target.value);
                  setName(e.target.value);
                  setIsChangingName(false);
                }
              }}
            />
          </group>
        </div>
      )}
      {!minimize && !isChangingName && (
        <div className="chat-open">
          <div className="texts">
            {texts.map((text, index) => (
              <div className="text" key={index}>
                <span className="name-tag" style={{ color: text.color }}>
                  {text.name}
                </span>
                : {text.text}
              </div>
            ))}
          </div>
          <div className="input">
            <input
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input !== "") {
                  handleClick();
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
