import type { LoadingStep } from "../types";

interface LoadingStatusProps {
  step: LoadingStep;
}

export function LoadingStatus({ step }: LoadingStatusProps) {
  return (
    <div className={`sumpage-loading ${step === "complete" ? "success" : ""}`}>
      <div className="sumpage-loading-icon">
        <div className="sumpage-spinner" />
      </div>
      <p>
        {step === "extracting" && "Extracting page content..."}
        {step === "connecting" && "Connecting to DeepSeek API..."}
        {step === "complete" && "Summary generated!"}
      </p>
    </div>
  );
}
