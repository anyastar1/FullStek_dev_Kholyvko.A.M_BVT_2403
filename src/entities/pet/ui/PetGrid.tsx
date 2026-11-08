import type { ReactNode } from "react";
import { Card, CardContent, Grid, Skeleton } from "@mui/material";
import { Reveal } from "@/shared/ui/Reveal";
import type { Pet } from "../model/types";
import { PetCard } from "./PetCard";

interface PetGridProps {
  pets: Pet[];
  showMatchScore?: boolean;
  twoColumns?: boolean;
  renderActions?: (pet: Pet) => ReactNode;
}
export function PetGrid({ pets, showMatchScore = false, twoColumns = false, renderActions }: PetGridProps) {
  return (
    <Grid container spacing={3}>
      {pets.map((pet, index) => (
        <Reveal key={pet.id} index={index}>
          <Grid item xs={12} sm={6} md={twoColumns ? 6 : 4}>
            <PetCard pet={pet} showMatchScore={showMatchScore} actions={renderActions?.(pet)} />
          </Grid>
        </Reveal>
      ))}
    </Grid>
  );
}

interface PetGridSkeletonProps {
  count?: number;
  twoColumns?: boolean;
}

export function PetGridSkeleton({ count = 6, twoColumns = false }: PetGridSkeletonProps) {
  return (
    <Grid container spacing={3} aria-busy="true" aria-label="Загрузка объявлений">
      {Array.from({ length: count }, (_, index) => (
        <Grid item xs={12} sm={6} md={twoColumns ? 6 : 4} key={index}>
          <Card>
            <Skeleton variant="rectangular" height={200} />
            <CardContent>
              <Skeleton width="60%" height={28} />
              <Skeleton width="80%" />
              <Skeleton width="50%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
