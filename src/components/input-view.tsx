import { Button } from "./ui/button";
import type { RefObject } from "react";
import { cn } from "../lib/utils";

const InputView = ({
  renderText,
  inputRef,
  userInput,
  handleInputChange,
  isCompleted,
  isTestStarted,
  restartTest,
}: {
  renderText: () => React.JSX.Element[];
  inputRef: RefObject<HTMLInputElement>;
  userInput: string;
  handleInputChange: (e: Event) => void;
  isCompleted: boolean;
  isTestStarted: boolean;
  restartTest: () => void;
}) => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="font-mono sm:text-xl sm:leading-relaxed tracking-wide mb-6 p-6 bg-card rounded-lg min-h-[200px] overflow-hidden">
        {renderText()}
      </div>

      <input
        ref={inputRef}
        type="text"
        value={userInput}
        onInput={handleInputChange}
        disabled={isCompleted}
        className={cn(
          "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[colorbox-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
        )}
        placeholder={
          isTestStarted
            ? "Keep typing..."
            : "Click here or start typing to begin..."
        }
        autoFocus
      />
      <div className="text-center mt-10">
        <Button onClick={restartTest} variant={"ghost"}>
          Press Tab + Enter to restart/shuffle
        </Button>
      </div>
    </div>
  );
};

export default InputView;
