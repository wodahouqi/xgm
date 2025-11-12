import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Toaster } from 'sonner'
import Header from './components/Header'
import RequireRole from '@/components/RequireRole'

const Home = lazy(() => import('./pages/Home'))
const Artworks = lazy(() => import('./pages/Artworks'))
const ArtworkDetail = lazy(() => import('./pages/ArtworkDetail'))
const Artists = lazy(() => import('./pages/Artists'))
const ArtistDetail = lazy(() => import('./pages/ArtistDetail'))
const Booking = lazy(() => import('./pages/Booking'))
const UserCenter = lazy(() => import('./pages/UserCenter'))
const UserProfile = lazy(() => import('./pages/user/Profile'))
const UserFavorites = lazy(() => import('./pages/user/Favorites'))
const UserOrders = lazy(() => import('./pages/user/Orders'))
const UserAddresses = lazy(() => import('./pages/user/Addresses'))
const UserPayment = lazy(() => import('./pages/user/Payment'))
const UserNotifications = lazy(() => import('./pages/user/Notifications'))
const UserSettings = lazy(() => import('./pages/user/Settings'))
const ArtistDashboard = lazy(() => import('./pages/ArtistDashboard'))
const ArtistOverview = lazy(() => import('./pages/artist/Overview'))
const ArtistArtworks = lazy(() => import('./pages/artist/Artworks'))
const ArtistOrders = lazy(() => import('./pages/artist/Orders'))
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))
const AdminUsers = lazy(() => import('./pages/admin/Users'))
const AdminArtworks = lazy(() => import('./pages/admin/Artworks'))
const AdminOrders = lazy(() => import('./pages/admin/Orders'))
const AdminAnalytics = lazy(() => import('./pages/admin/Analytics'))
const AdminCategories = lazy(() => import('./pages/admin/Categories'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Suspense fallback={<div className="p-4">Loading...</div>}>
        <Outlet />
      </Suspense>
      <Toaster position="top-right" />
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/artworks',
        element: <Artworks />
      },
      {
        path: '/artworks/:id',
        element: <ArtworkDetail />
      },
      {
        path: '/artists',
        element: <Artists />
      },
      {
        path: '/artists/:id',
        element: <ArtistDetail />
      },
      {
        path: '/booking/:artworkId',
        element: <Booking />
      },
      {
        path: '/user-center',
        element: <UserCenter />,
        children: [
          {
            path: '/user-center',
            element: <UserProfile />
          },
          {
            path: '/user-center/profile',
            element: <UserProfile />
          },
          {
            path: '/user-center/favorites',
            element: <UserFavorites />
          },
          {
            path: '/user-center/orders',
            element: <UserOrders />
          },
          {
            path: '/user-center/addresses',
            element: <UserAddresses />
          },
          {
            path: '/user-center/payment',
            element: <UserPayment />
          },
          {
            path: '/user-center/notifications',
            element: <UserNotifications />
          },
          {
            path: '/user-center/settings',
            element: <UserSettings />
          }
        ]
      },
      {
        path: '/artist-dashboard',
        element: (
          <RequireRole role="artist">
            <ArtistDashboard />
          </RequireRole>
        ),
        children: [
          {
            path: '/artist-dashboard',
            element: <ArtistOverview />
          },
          {
            path: '/artist-dashboard/artworks',
            element: <ArtistArtworks />
          },
          {
            path: '/artist-dashboard/orders',
            element: <ArtistOrders />
          }
        ]
      },
      {
        path: '/admin-dashboard',
        element: (
          <RequireRole role="admin">
            <AdminDashboard />
          </RequireRole>
        ),
        children: [
          {
            path: '/admin-dashboard',
            element: <AdminAnalytics />
          },
          {
            path: '/admin-dashboard/users',
            element: <AdminUsers />
          },
          {
            path: '/admin-dashboard/artworks',
            element: <AdminArtworks />
          },
          {
            path: '/admin-dashboard/orders',
            element: <AdminOrders />
          },
          {
            path: '/admin-dashboard/categories',
            element: <AdminCategories />
          },
          {
            path: '/admin-dashboard/analytics',
            element: <AdminAnalytics />
          }
        ]
      },
      {
        path: '/login',
        element: <Login />
      },
      {
        path: '/register',
        element: <Register />
      }
    ]
  }
])

export default function Routes() {
  return <RouterProvider router={router} />
}
