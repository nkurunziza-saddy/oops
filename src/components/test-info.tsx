const TestInfo = ({
  timeLeft,
  isTestStarted,
  calculateWPM,
  calculateAccuracy,
  mistakes,
}: {
  timeLeft: number;
  isTestStarted: boolean;
  calculateWPM: () => number;
  calculateAccuracy: () => number;
  mistakes: number;
}) => {
  return (
    <div className="flex justify-center gap-8 mb-8">
      <div className="text-center">
        <div className="text-lg sm:text-2xl font-semibold">{timeLeft}</div>
        <div className="text-sm text-muted-foreground">time</div>
      </div>
      <div className="text-center">
        <div className="text-lg sm:text-2xl font-semibold">
          {isTestStarted ? calculateWPM() : 0}
        </div>
        <div className="text-sm text-muted-foreground">wpm</div>
      </div>
      <div className="text-center">
        <div className="text-lg sm:text-2xl font-semibold">
          {calculateAccuracy()}%
        </div>
        <div className="text-sm text-muted-foreground">accuracy</div>
      </div>
      <div className="text-center">
        <div className="text-lg sm:text-2xl font-semibold">{mistakes}</div>
        <div className="text-sm text-muted-foreground">mistakes</div>
      </div>
    </div>
  );
};

export default TestInfo;
