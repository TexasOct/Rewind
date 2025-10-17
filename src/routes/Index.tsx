import { App } from '@/views/App'
import { LoginForm } from '@/views/Auth/Login'
import { AuthLayout } from '@/layouts/Auth'
import { createBrowserRouter } from 'react-router'

export const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    children: [
      {
        path: '/auth',
        Component: AuthLayout,
        children: [
          { path: 'login', Component: LoginForm },
          { path: 'register', Component: LoginForm }
        ]
      }
    ]
  }
])
