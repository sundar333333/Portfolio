interface WhiteSectionProps {
  progress: number;
}

export function WhiteSection({ progress }: WhiteSectionProps) {
  const translateY = Math.max(0, 100 - progress * 100);

  return (
    <div
      className="fixed inset-0 z-20 bg-white pointer-events-none"
      style={{
        transform: `translateY(${translateY}%)`,
      }}
      data-testid="white-section"
    />
  );
}
