export function DragRegion() {
  return (
    <div
      data-tauri-drag-region
      className="h-5 w-full select-none bg-background"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    />
  )
}
