import { useState, useEffect, useRef, useCallback } from "preact/hooks";
import { generateText } from "./data/words";
import { Button } from "./components/ui/button";
import { Textarea } from "./components/ui/textarea";
import InputView from "./components/input-view";
import TestInfo from "./components/test-info";
import { Label } from "./components/ui/label";
import { ThemeToggler } from "./components/theme-toggler";
interface TestSettings {
  mode: "easy" | "hard" | "custom";
  wordCount: number;
  duration: number;
}

interface TestState {
  text: string;
  userInput: string;
  currentIndex: number;
  startTime: number | null;
  endTime: number | null;
  mistakes: number;
  isCompleted: boolean;
  timeLeft: number;
}

function App() {
  const [settings, setSettings] = useState<TestSettings>({
    mode: "easy",
    wordCount: 50,
    duration: 30,
  });

  const [customText, setCustomText] = useState<string>("");

  const [testState, setTestState] = useState<TestState>({
    text: "",
    userInput: "",
    currentIndex: 0,
    startTime: null,
    endTime: null,
    mistakes: 0,
    isCompleted: false,
    timeLeft: 30,
  });

  const [isTestStarted, setIsTestStarted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | NodeJS.Timeout | null>(null);

  useEffect(() => {
    const newText = generateText(settings.mode, settings.wordCount, customText);
    setTestState((prev) => ({
      ...prev,
      text: newText,
      userInput: "",
      currentIndex: 0,
      startTime: null,
      endTime: null,
      mistakes: 0,
      isCompleted: false,
      timeLeft: settings.duration,
    }));
    setIsTestStarted(false);
    setShowResults(false);
  }, [settings, customText]);

  useEffect(() => {
    if (isTestStarted && !testState.isCompleted) {
      timerRef.current = setInterval(() => {
        setTestState((prev) => {
          const newTimeLeft = prev.timeLeft - 1;
          if (newTimeLeft <= 0) {
            return {
              ...prev,
              timeLeft: 0,
              isCompleted: true,
              endTime: Date.now(),
            };
          }
          return { ...prev, timeLeft: newTimeLeft };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTestStarted, testState.isCompleted]);

  useEffect(() => {
    if (testState.isCompleted) {
      setShowResults(true);
      setIsTestStarted(false);
    }
  }, [testState.isCompleted]);

  const restartTest = useCallback(() => {
    const newText = generateText(settings.mode, settings.wordCount, customText);
    setTestState({
      text: newText,
      userInput: "",
      currentIndex: 0,
      startTime: null,
      endTime: null,
      mistakes: 0,
      isCompleted: false,
      timeLeft: settings.duration,
    });
    setIsTestStarted(false);
    setShowResults(false);
    if (
      inputRef.current &&
      typeof (inputRef.current as any).focus === "function"
    ) {
      (inputRef.current as any).focus();
    }
  }, [settings.mode, settings.wordCount, settings.duration, customText]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Tab + Enter to restart
      if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault();
        restartTest();
      }
      // Escape to restart
      if (e.key === "Escape") {
        e.preventDefault();
        restartTest();
      }
      // Focus input when any key is pressed (except special keys)
      if (
        !showResults &&
        !e.ctrlKey &&
        !e.altKey &&
        !e.metaKey &&
        e.key.length === 1
      ) {
        settings.mode !== "custom" && inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showResults, restartTest]);

  const handleInputChange = useCallback(
    (e: Event) => {
      const target = e.target as HTMLInputElement;
      const value = target.value;

      if (!isTestStarted && value.length > 0) {
        setIsTestStarted(true);
        setTestState((prev) => ({
          ...prev,
          startTime: Date.now(),
        }));
      }

      let mistakes = testState.mistakes;

      if (value.length > testState.userInput.length) {
        const newCharIndex = value.length - 1;
        if (newCharIndex < testState.text.length) {
          const expectedChar = testState.text[newCharIndex];
          const typedChar = value[newCharIndex];
          if (expectedChar !== typedChar) {
            mistakes++;
          }
        }
      }

      setTestState((prev) => ({
        ...prev,
        userInput: value,
        currentIndex: value.length,
        mistakes,
        isCompleted: value.length >= prev.text.length,
      }));
    },
    [
      isTestStarted,
      testState.mistakes,
      testState.userInput.length,
      testState.text,
    ]
  );

  const calculateWPM = () => {
    if (!testState.startTime || !testState.endTime) return 0;
    const timeInMinutes = (testState.endTime - testState.startTime) / 60000;
    const wordsTyped = testState.userInput.split(" ").length;
    return Math.round(wordsTyped / timeInMinutes);
  };

  const calculateAccuracy = () => {
    if (testState.userInput.length === 0) return 100;
    const correctChars = testState.userInput.length - testState.mistakes;
    return Math.round((correctChars / testState.userInput.length) * 100);
  };

  const renderText = () => {
    return testState.text.split("").map((char, index) => {
      let className = "pending";

      if (index < testState.userInput.length) {
        className =
          testState.userInput[index] === char ? "correct" : "incorrect";
      } else if (index === testState.currentIndex) {
        className = "current";
      }

      return (
        <span key={`${index}-${char}`} className={className}>
          {char}
        </span>
      );
    });
  };

  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-6xl mx-auto">
        <div className={"flex justify-between items-center"}>
          <div className=" mb-12">
            <h1 className="text-2xl sm:text-4xl font-bold text-primary mb-1 sm:mb-2">
              Oops
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Oops. Go again
            </p>
          </div>
          <ThemeToggler />
        </div>

        <div
          className={
            "flex flex-col sm:flex-row max-w-4xl mx-auto sm:justify-center gap-8 mb-8 flex-wrap"
          }
        >
          <div className="flex flex-col gap-2">
            <h5 className={"text-sm text-muted-foreground"}>Mode</h5>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  setSettings((prev) => ({ ...prev, mode: "easy" }))
                }
                variant={settings.mode === "easy" ? "default" : "outline"}
              >
                Easy
              </Button>

              <Button
                onClick={() =>
                  setSettings((prev) => ({ ...prev, mode: "hard" }))
                }
                variant={settings.mode === "hard" ? "default" : "outline"}
              >
                Hard
              </Button>
              <Button
                onClick={() =>
                  setSettings((prev) => ({ ...prev, mode: "custom" }))
                }
                variant={settings.mode === "custom" ? "default" : "outline"}
              >
                Custom
              </Button>
            </div>
          </div>

          {settings.mode !== "custom" ? (
            <div className="flex flex-col gap-2">
              <h5 className={"text-sm text-muted-foreground"}>Word count</h5>
              <div className="flex gap-2">
                {[25, 50, 100].map((count) => (
                  <Button
                    key={count}
                    onClick={() =>
                      setSettings((prev) => ({ ...prev, wordCount: count }))
                    }
                    variant={
                      settings.wordCount === count ? "default" : "outline"
                    }
                  >
                    {count}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className={"invisible"}></div>
          )}

          <div className="flex flex-col gap-2">
            <h5 className={"text-sm text-muted-foreground"}>Duration</h5>
            <div className="flex gap-2">
              {[15, 30, 60, 120].map((duration) => (
                <Button
                  key={duration}
                  onClick={() => setSettings((prev) => ({ ...prev, duration }))}
                  variant={
                    settings.duration === duration ? "default" : "outline"
                  }
                >
                  {duration}s
                </Button>
              ))}
            </div>
          </div>
        </div>

        {settings.mode === "custom" && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="sm:text-center mb-4">
              <Label htmlFor="customText">
                Enter your custom text to practice typing:
              </Label>
            </div>
            <Textarea
              id="customText"
              value={customText}
              onChange={(e) =>
                setCustomText((e.target as HTMLTextAreaElement).value)
              }
              placeholder="Paste or type your custom text here..."
              rows={4}
            />
            <div className="sm:text-center mt-2 text-muted-foreground text-sm">
              {customText.length} characters •{" "}
              {customText.split(" ").filter((word) => word.length > 0).length}{" "}
              words
            </div>
          </div>
        )}
        <TestInfo
          calculateAccuracy={calculateAccuracy}
          calculateWPM={calculateWPM}
          isTestStarted={isTestStarted}
          mistakes={testState.mistakes}
          timeLeft={testState.timeLeft}
        />

        {showResults && (
          <div className="text-center mb-8 p-8 bg-card border rounded-lg">
            <h2 className="text-lg sm:text-2xl font-bold mb-6">
              Test Complete!
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="sm:text-3xl font-semibold text-xl sm:font-bold text-primary">
                  {calculateWPM()}
                </div>
                <div className="text-muted-foreground">WPM</div>
              </div>
              <div>
                <div className="sm:text-3xl font-semibold text-xl sm:font-bold text-primary">
                  {calculateAccuracy()}%
                </div>
                <div className="text-muted-foreground">Accuracy</div>
              </div>
              <div>
                <div className="sm:text-3xl font-semibold text-xl sm:font-bold text-destructive/70">
                  {testState.mistakes}
                </div>
                <div className="text-muted-foreground">Mistakes</div>
              </div>
              <div>
                <div className="sm:text-3xl font-semibold text-xl sm:font-bold text-primary">
                  {testState.userInput.length}
                </div>
                <div className="text-muted-foreground">Characters</div>
              </div>
            </div>
            <Button onClick={restartTest} size={"lg"} className={"mt-8"}>
              Try Again
            </Button>
          </div>
        )}

        {!showResults && (
          <InputView
            renderText={renderText}
            inputRef={inputRef}
            userInput={testState.userInput}
            handleInputChange={handleInputChange}
            isCompleted={testState.isCompleted}
            isTestStarted={isTestStarted}
            restartTest={restartTest}
          />
        )}
      </div>
    </main>
  );
}

export default App;
