type CreatePageProps = {
  homePrompt: string;
  setHomePrompt: (
    value: string
  ) => void;
  quickStarts: string[];
  handleKeyDown: (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => void;
  createProject: (
    prompt: string
  ) => void;
  setCurrentMode: (
    mode: "plan" | "build"
  ) => void;
  action: (
    label: string
  ) => void;
};

import React from "react";
import {
  Plus,
  Send,
} from "lucide-react";

export function CreatePage({
  homePrompt,
  setHomePrompt,
  quickStarts,
  handleKeyDown,
  createProject,
  setCurrentMode,
  action,
}: CreatePageProps) {
  return (
    <main className="create-screen">
      <section className="create-hero">
        <div className="workspace-pill">
          <span className="live-dot" />
          Vivus local workspace
        </div>

        <h1>
          What do you want
          to build?
        </h1>

        <p className="hero-subtitle">
          Create anything.
          Vivus is your
          local AI-powered
          canvas.
        </p>

        <div className="quick-pill-row">
          {quickStarts.map(
            (item) => (
              <button
                key={item}
                type="button"
                className="quick-pill"
                onClick={() =>
                  setHomePrompt(
                    `Build a ${item.toLowerCase()}`
                  )
                }
              >
                {item}
              </button>
            )
          )}
        </div>

        <form
          className="home-composer"
          onSubmit={(event) => {
            event.preventDefault();
            createProject(
              homePrompt
            );
          }}
        >
          <textarea
            placeholder="Describe your idea or paste a local project path..."
            value={homePrompt}
            onChange={(
              event
            ) =>
              setHomePrompt(
                event.target
                  .value
              )
            }
            onKeyDown={
              handleKeyDown
            }
          />

          <button
            type="button"
            className="home-composer-plus"
            onClick={() =>
              action(
                "Attach files/photos"
              )
            }
            aria-label="Attach files"
          >
            <Plus
              size={18}
              strokeWidth={2.5}
            />
          </button>

          <div className="home-composer-actions">
            <button
              type="button"
              className="soft-button"
              onClick={() =>
                setCurrentMode(
                  "plan"
                )
              }
            >
              Plan
            </button>

            <button
              type="submit"
              className="send-button"
              aria-label="Create project"
            >
              <Send
                size={17}
                strokeWidth={2.5}
              />
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
