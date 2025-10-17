export type menuItem<T> = {
  title: string
  icon: string
  action: (item: T) => void
}
