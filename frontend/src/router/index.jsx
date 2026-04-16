import { createBrowserRouter, redirect } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import NotFound from '../pages/NotFound';
import Layout from '../layouts/layout';
import Home from '../pages/Home';
import GuestLayout from '../layouts/GuestLayout';
import SyndicDashboardLayout from '../layouts/Syndic/SyndicDashboardLayout';
import SyndicDashboard from '../components/Syndic/SyndicDashboard';
import { axiosClient } from "@/lib/axios";


export const LOGIN_ROUTE = '/login'
export const SYNDIC_DASHBOARD_ROUTE = '/syndic/dashboard'

async function syndicAuthLoader() {
    try {
        await axiosClient.get("/user");
        return null;
    } catch {
        throw redirect(LOGIN_ROUTE);
    }
}


export const router = createBrowserRouter([
    {
        element: <Layout />,
        children: [ 
            {
            path: '/',
            element: <Home />
            },
            {
                path: '/register',
                element: <Register />
            },
                
            {
                path: '*',
                element: <NotFound />
            },
        ]
    },
    {
        element: <GuestLayout />,
        children: [
            {
                path: LOGIN_ROUTE,
                element: <Login />
            },
        ]
    },
    {
        element: <SyndicDashboardLayout />,
        children: [
            {
                    path: SYNDIC_DASHBOARD_ROUTE,
                    loader: syndicAuthLoader,
                    element: <SyndicDashboard />
                },
        ]
    },
   
])
