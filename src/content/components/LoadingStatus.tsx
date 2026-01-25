import { LoadingContainer } from "./styles";

interface LoadingStatusProps {
  step: "idle" | "extracting" | "connecting" | "complete";
}

export function LoadingStatus({ step }: LoadingStatusProps) {
  const getMessage = () => {
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

  return (
    <LoadingContainer $success={step === "complete"}>
      <div className="sumpage-loading-icon">
        <div className="sumpage-spinner" />
      </div>
      <p>{getMessage()}</p>
    </LoadingContainer>
  );
}
