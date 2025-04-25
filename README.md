
# Voice Notes App

A modern web application for creating and managing notes through voice recording and transcription.

## Features

- Voice Recording & Transcription: Record your thoughts and automatically convert them to text
- Category Organization: Organize notes by categories
- Real-time Updates: See changes instantly across the application
- User Authentication: Secure access to your personal notes
- Responsive Design: Works seamlessly on desktop and mobile devices

## Technology Stack

This application is built with:

- React + TypeScript for the frontend
- Tailwind CSS for styling
- Supabase for backend services (authentication and database)
- Shadcn UI for component library

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```
3. Start the development server:
```bash
npm run dev
```

## Usage

1. Sign in to your account
2. Click "Add New Note" to start recording
3. Select a category for your note
4. Record your voice note
5. Review and edit the transcription
6. Save your note

## Note Features

- Create notes using voice recording
- Edit existing notes
- Delete notes you no longer need
- Organize notes by categories
- View all notes in a responsive grid layout

## Authentication

The app uses Supabase authentication to secure your notes. Only authenticated users can:
- Create new notes
- Edit their own notes
- Delete their own notes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request