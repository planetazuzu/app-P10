# **App Name**: Global Medic Response

## Core Features:

- Secure Authentication: User authentication with role-based access control (admin, hospital, individual, ambulance) to protect the routes.
- Ambulance Tracking: Display simulated real-time location of ambulances on a map. Users can filter ambulances by type and availability, can view details of selected ambulances. Location data will be simulated, using local data structures, due to complexity and to meet user requirement for local db.
- Smart Dispatch: Suggest the optimal dispatch of vehicles to requests. The AI tool determines which vehicles are best positioned to assist at an emergency, incorporating simulated real-time data, patient needs, traffic, weather and vehicle availability.
- Request Management: Allow users to submit new request, advanced requests, follow up on requests, visualize the history of past requests, or send messages. All features take into consideration RBAC roles.

## Style Guidelines:

- Primary color: Verde Rioja (#76BC21).
- Secondary color: Azul Rioja (#243746).
- Background color: Blanco (#FFFFFF).
- Use a serif font as the default, with Georgia and Times New Roman as fallbacks.
- Use .rioja-container for the main content.
- Use .page-title (large Azul Rioja text) for page titles.
- Use .section-title (medium Azul Rioja text) for section titles.
- Use .card-stats (cards with Verde Rioja border) for statistics cards.
- Use .btn-primary (Verde Rioja) for primary buttons.
- Use .btn-secondary (Azul Rioja) for secondary buttons.
- Use .btn-outline (Azul Rioja outline) for outline buttons.
- Use a border radius of 0.5rem for UI elements like buttons.