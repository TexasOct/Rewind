import '@/styles/index.css'
import { ThemeProvider } from '@/components/custom/system/theme/theme-provider'
import { Outlet } from 'react-router'

function App() {
  return (
    <main>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Outlet />
      </ThemeProvider>
    </main>
  )
}

export { App }
