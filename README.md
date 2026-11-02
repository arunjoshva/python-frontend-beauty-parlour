# Jerusha Beauty Parlour – Frontend

A responsive appointment booking website for **Jerusha Beauty Parlour**, built with Next.js, React, TypeScript, and Tailwind CSS. Customers can explore beauty services, check appointment availability, and book appointments. Administrators can log in to manage appointments, services, and customer records.

## Live Demo

**Frontend:** https://python-frontend-beauty-parlour.netlify.app/

**Backend API:** https://python-backend-beauty-parlour.onrender.com/

## Technologies Used

- **Next.js 16** – React framework
- **React 19** – User interface
- **TypeScript** – Type safety
- **Tailwind CSS 4** – Styling
- **Axios** – HTTP requests
- **Netlify** – Frontend deployment

## Features

### Customer Features

- Responsive home page.
- View the latest active services.
- Browse all available beauty services.
- Book appointments by selecting a service, date, and available time slot.
- View available appointment slots dynamically.
- Customer information is saved and associated with bookings.
- Form validation for appointment booking.

### Admin Features

- Admin login and logout.
- Protected admin dashboard.
- View appointment statistics.
- View, search, and filter appointments.
- Update appointment statuses and cancel appointments.
- Create, edit, activate, and deactivate services.
- View and search customer records.

### Authentication and Security

- JWT-based admin authentication using HttpOnly cookies.
- CSRF protection for state-changing requests.
- Axios configured to send credentials with API requests.
- Protected admin pages and API requests.

## Project Structure

```text
frontend/
├── app/
│   ├── admin/
│   │   ├── login/
│   │   ├── dashboard/
│   │   ├── services/
│   │   └── customers/
│   ├── booking/
│   ├── services/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Header.tsx
│   └── Footer.tsx
├── lib/
│   ├── api.ts
│   ├── axios.ts
│   └── admin.ts
├── types/
│   └── service.ts
├── public/
├── .env.local
├── next.config.ts
├── package.json
└── README.md
```

## Deployment

The frontend is deployed using **Netlify**.

To deploy your own version:

1. Push the frontend project to GitHub.
2. Import the repository into Netlify.
3. Configure the `NEXT_PUBLIC_API_URL` environment variable with your backend URL.
4. Deploy the application.

---

Developed as a full-stack web development portfolio project.