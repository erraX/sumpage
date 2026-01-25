import { ErrorContainer, RetryButton } from "./styles";

interface ErrorNoticeProps {
  message: string;
  onRetry: () => void;
}

export function ErrorNotice({ message, onRetry }: ErrorNoticeProps) {
  return (
    <ErrorContainer>
      <p>{message}</p>
      <RetryButton onClick={onRetry}>
        Retry
      </RetryButton>
    </ErrorContainer>
  );
}
