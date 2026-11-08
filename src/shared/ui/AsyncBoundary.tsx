import type { ReactNode } from "react";
import { ErrorState } from "./StateViews";

interface AsyncBoundaryProps<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  skeleton: ReactNode;
  empty: ReactNode;
  isEmpty?: (data: T) => boolean;
  children: (data: T) => ReactNode;
}
export function AsyncBoundary<T>({
  data,
  loading,
  error,
  onRetry,
  skeleton,
  empty,
  isEmpty,
  children,
}: AsyncBoundaryProps<T>) {
  if (loading) return <>{skeleton}</>;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (data === null || (isEmpty && isEmpty(data))) return <>{empty}</>;
  return <>{children(data)}</>;
}
