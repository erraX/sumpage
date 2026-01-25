import { memo } from "react";
import { LoadingContainer } from "./styles";

interface LoadingStatusProps {
  step: "idle" | "extracting" | "connecting" | "complete";
}

const getMessage = (step: LoadingStatusProps["step"]) => {
  switch (step) {
    case "extracting":
      return "Extracting page content...";
    case "connecting":
      return "Connecting to DeepSeek API...";
    case "complete":
      return "Summary generated!";
    default:
      return "";
  }
};

export const LoadingStatus = memo(function LoadingStatus({ step }: LoadingStatusProps) {
  return (
    <LoadingContainer $success={step === "complete"}>
      <div className="sumpage-loading-icon">
        <div className="sumpage-spinner" />
      </div>
      <p>{getMessage(step)}</p>
    </LoadingContainer>
  );
});
