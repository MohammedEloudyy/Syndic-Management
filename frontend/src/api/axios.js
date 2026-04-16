import axios from 'axios'

export const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL ?? '',
    withCredentials: true,
})

// Add CSRF token to requests
axiosClient.interceptors.request.use((config) => {
    const token = getCookie('XSRF-TOKEN')
    if (token) {
        config.headers['X-XSRF-TOKEN'] = token
    }

    return config
})

// Helper function to get cookie value
function getCookie(name) {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
        const rawValue = parts.pop().split(';').shift()
        return decodeURIComponent(rawValue)
    }
}