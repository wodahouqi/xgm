import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom'
import { Toaster } from 'sonner'
import Header from './components/Header'
import Home from './pages/Home'
import Artworks from './pages/Artworks'
import ArtworkDetail from './pages/ArtworkDetail'
import Artists from './pages/Artists'
import ArtistDetail from './pages/ArtistDetail'
import Booking from './pages/Booking'
import UserCenter from './pages/UserCenter'
import UserProfile from './pages/user/Profile'
import UserFavorites from './pages/user/Favorites'
import UserOrders from './pages/user/Orders'
import UserAddresses from './pages/user/Addresses'
import UserPayment from './pages/user/Payment'
import UserNotifications from './pages/user/Notifications'
import UserSettings from './pages/user/Settings'
import ArtistDashboard from './pages/ArtistDashboard'
import ArtistOverview from './pages/artist/Overview'
import ArtistArtworks from './pages/artist/Artworks'
import ArtistOrders from './pages/artist/Orders'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/admin/Users'
import AdminArtworks from './pages/admin/Artworks'
import AdminOrders from './pages/admin/Orders'
import AdminAnalytics from './pages/admin/Analytics'
import AdminCategories from './pages/admin/Categories'
import Login from './pages/Login'
import Register from './pages/Register'
import RequireRole from '@/components/RequireRole'

function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Outlet />
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