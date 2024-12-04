# Micro Tracker

### INF654

### Sokly Hour

### Final Project

**Live Deployment**: https://tracker-61a00.firebaseapp.com/

## Project Title

The **Micro Tracker** is a feature-complete Progressive Web Application (PWA) designed to help users track their meals and nutritional intake. Users can easily add meals to their tracker, set daily calorie goals, and view their nutritional summary. It integrates **Firebase** for online data storage, **IndexedDB** for offline functionality, and incorporates essential PWA features like a service worker and manifest.json to ensure seamless user experience across online and offline modes.

## Description

### Features

- **Add Meals**: Users can enter meal names and their nutritional values (calories, carbs, proteins, fats).
- **Set Daily Calorie Goal**: Allows users to specify a target for daily calorie intake.
- **Remove Meals**: Delete meals from the tracker for better management.
- **Daily Summary**: View aggregated nutrient information for the day.
- **Offline Support**: Full offline functionality enabled via IndexedDB and service workers.
- **User Authentication**: Secure Firebase Authentication allows users to manage personal data across sessions and devices. Each user to have their own unique meals saved in the database(Linking User Data Firebase). Therefore, users can only access their own data.

## Core Functionalities

## Firebase and IndexedDB Integration

This project integrates Firebase for online data storage and IndexedDB for offline data storage. Here's how each feature works:

### Firebase Integration (Online Data Storage)

- **Firebase Firestore or Realtime Database**: is used for storing meal data when the user is online.
- **CRUD operations (Create, Read, Update, Delete)**: are implemented to manage meal data in Firebase.
- **Unique identifiers**: are used to prevent conflicts during syncing, and Firebase data is automatically synchronized with IndexedDB when the app is offline.

### IndexedDB Integration (Offline Data Storage)

- **IndexedDB**: is set up to store meal data when the app is offline, ensuring users can still interact with their meal tracker even without an internet connection. When the app goes back online, the data in IndexedDB is synchronized with Firebase.

### Core Components Verification

- **Firebase Integration**: Ensures real-time data syncing with Firebase cloud storage.
- **IndexedDB**: Validates offline storage and synchronization with Firebase.
- **Service Worker**: Verifies offline asset caching and app reliability.
- **Manifest.json**: Confirms installation readiness with proper configuration for PWA properties.

### Authentication

- **Sign-In/Out**: Allows users to securely log in and out.
- **Data Association**: Ensures user data is tied to their account and synced across sessions and devices.

### Finalizing Functionality

- **Offline Functionality**: Core features remain operational offline.
- **Data Synchronization**: Refines the logic for seamless syncing between IndexedDB and Firebase.
- **Cache Optimization**: Improves service worker caching for better offline performance.

### Data Synchronization Logic

- The app detects online/offline status and toggles between Firebase and IndexedDB storage.
- Data from IndexedDB is synced to Firebase when the app reconnects to the internet.
- Firebase-generated IDs are used across both online and offline data to avoid conflicts and duplicates during synchronization.
  
### Offline Data Handling in Service Worker

- The service worker is updated to handle caching of necessary resources for offline functionality.
- Essential scripts and assets are cached for CRUD operations to work when the app is offline.
  
### UI and Error Handling

- CRUD operations are accessible via forms and buttons.
- Notifications are displayed when offline data is synced with Firebase upon reconnecting.
- Error handling is in place for smooth transitions between online and offline modes.

## Technologies Used

- **HTML5**: Structural foundation of the application.
- **CSS3**: Styling for a modern, responsive design.
- **Materialize CSS**: Framework for implementing Material Design principles.
- **JavaScript**: Powers dynamic features and application logic.
- **Firebase**: Cloud storage, real-time database, and user authentication.
- **IndexedDB**: Offline data storage and synchronization.
- **PWA Technologies**: Includes service workers and manifest.json for offline support and app installation.

## Getting Started

To run this project locally, follow these steps:

1. **Clone the repository in the terminal**:

   ```bash
   git clone https://github.com/SoklyHour/Sokly_INF654.git

2. **Install dependencies:**: If your project requires any external libraries or dependencies, you will need to install them using npm or other package managers. For example, to install the Firebase SDK:

   ```bash
   npm install firebase

- If you're using any other libraries, make sure to check your project for the necessary installation commands.

### Run the project

- Open the project in your preferred code editor (e.g., Visual Studio Code). You can use the Live Server extension in Visual Studio Code to serve the project locally and view it in the browser by clicking **Go Live**.

### Prerequisites

- **Live Server extension**: Make sure to install the Live Server extension in Visual Studio Code for easy development.
- **Web Browser**: Use any modern web browser (e.g., Chrome, Firefox, Safari).

### Testing the Application

- Test Online: Ensure that the app syncs data to Firebase when online and updates the UI in real-time.
- Test Offline: Test adding, updating, and deleting meals while offline. Ensure that data is stored in IndexedDB and synced to Firebase when the app goes online again.
- Cross-Device Compatibility: Test the application on multiple devices and browsers to confirm consistent performance and responsiveness.
- UI Validation: Test responsiveness and theming for seamless user experience.
  
### Authors

Contributors name: Sokly Hour
