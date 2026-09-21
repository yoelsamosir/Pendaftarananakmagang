import {
  APPLICATION_STATUS_COLOR,
  APPLICATION_STATUS_LABEL,
  COMPLETION_STATUS_COLOR,
  COMPLETION_STATUS_LABEL,
} from "@/lib/constants";

export function ApplicationStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        APPLICATION_STATUS_COLOR[status] ?? "bg-stone-100 text-stone-700"
      }`}
    >
      {APPLICATION_STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function CompletionStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        COMPLETION_STATUS_COLOR[status] ?? "bg-stone-100 text-stone-700"
      }`}
    >
      {COMPLETION_STATUS_LABEL[status] ?? status}
    </span>
  );
}
