import HUDCard from "../hud/HUDCard";

interface PageSkeletonProps {
  icon: string;
  title: string;
  stage: number;
}

export default function PageSkeleton({ icon, title, stage }: PageSkeletonProps) {
  return (
    <div className="h-full flex items-center justify-center p-8">
      <HUDCard className="max-w-md w-full text-center py-12" glow="none">
        <div className="text-4xl mb-4">{icon}</div>
        <h2 className="font-mono text-lg text-hud-text mb-2">{title}</h2>
        <p className="text-hud-text-dim text-sm">
          Coming in Stage {stage}
        </p>
        <div className="mt-6 h-px bg-gradient-to-r from-transparent via-hud-border to-transparent" />
        <p className="mt-4 text-xs text-hud-text-dim font-mono tracking-wider uppercase">
          Module not yet active
        </p>
      </HUDCard>
    </div>
  );
}
