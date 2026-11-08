import { Chip } from "@mui/material";
import type { ListingStatus } from "../model/types";
import { statusLabel } from "../model/types";

export function StatusChip({ status }: { status: ListingStatus }) {
  return <Chip label={statusLabel[status]} color={status} size="small" sx={{ position: "absolute", top: 12, left: 12 }} />;
}
