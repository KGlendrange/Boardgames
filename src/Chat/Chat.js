import React, { useState, useEffect } from "react";
import "./Chat.css";

//a chat app with your connection
export function Chat({ connection, name }) {
  const mainColor = "purple";
  const [minimize, setMinimize] = useState(false);
  const [input, setInput] = useState("");
  const [texts, setTexts] = useState([
    {
      name: "Petter",
      text: "Heisann",
      color: "red"
    },
    {
      name: "Boris",
      text: "Står til?",
      color: "blue"
    }
  ]);

  function handleClick() {
    const newText = {
      name,
      text: input,
      color: mainColor
    };
    console.log("connection inside chat?");
    if (connection) {
      console.log("yes.., sending data", newText);
      connection.send(newText);
    }

    setTexts([...texts, newText]);

    setInput(""); //clear input
  }

  if (connection) {
    connection.on("data", (data) => {
      console.log("data: ", data);
    });
  }

  useEffect(() => {
    if (connection) {
      connection.on("data", (data) => {
        console.log("data: ", data);
        setTexts([...texts, data]);
      });
    }
  }, [connection]);

  return (
    <div className={`chat ${!minimize ? "chat--border" : ""}`}>
      <button className="minimize" onClick={() => setMinimize((prev) => !prev)}>
        {minimize ? "show chat" : "hide chat"}
      </button>
      {!minimize && (
        <div className="chat-open">
          <div className="texts">
            {texts.map((text, index) => (
              <div className="text" key={index}>
                <span style={{ color: text.color }}>{text.name}</span>:{" "}
                {text.text}
              </div>
            ))}
          </div>
          <div className="input">
            <span style={{ color: mainColor }}>{name}: </span>
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
