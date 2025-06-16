# Book Inventory Builder 📚

A modern web application for educators and librarians to digitize their book collections using AI-powered image recognition. Simply photograph book covers, and let AI automatically extract book details for your digital inventory.

## 🚀 Features

- **AI-Powered Extraction**: Upload book cover images and automatically extract title, author, grade level, subject, and series information using Google Gemini Vision AI
- **Image Processing**: Drag & drop or click to upload JPG/PNG book cover images
- **Manual Verification**: Review and edit AI-extracted details before saving
- **Digital Inventory**: Store and manage your complete book collection in MongoDB
- **Smart Search**: Real-time search functionality with text highlighting
- **Responsive Design**: Modern, mobile-friendly interface built with Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: Google Gemini 1.5 Flash (Vision API)
- **Database**: MongoDB Atlas
- **Deployment**: Vercel-ready

## 📋 Prerequisites

Before you begin, ensure you have the following:

- Node.js 18+ installed on your machine
- A Google AI API key (free tier available)
- A MongoDB Atlas account (free tier available)

## ⚙️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd book-inventory-builder
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

1. Copy the sample environment file:
   ```bash
   cp .env.sample .env.local
   ```

2. Get your Google AI API Key:
   - Visit [Google AI Studio](https://ai.google.dev/)
   - Sign in with your Google account
   - Create a new API key
   - Copy the API key

3. Set up MongoDB Atlas:
   - Go to [MongoDB Atlas](https://cloud.mongodb.com/)
   - Create a free account and cluster (M0 Sandbox)
   - Go to "Database Access" → Create a database user with username/password
   - Go to "Network Access" → Add your IP address (or 0.0.0.0/0 for development)
   - Go to "Connect" → "Drivers" → Copy the connection string
   - Replace `<username>` and `<password>` with your database user credentials

4. Update your `.env.local` file:
   ```env
   GOOGLE_API_KEY="your_google_ai_api_key_here"
   MONGO_URI="mongodb+srv://username:password@cluster.mongodb.net/bookInventoryDB?retryWrites=true&w=majority"
   ```

### 4. Run the Application

```bash
npm run dev
```

### 5. Open in Browser

Navigate to [http://localhost:3000](http://localhost:3000) to see the application running.

## � Screenshots

### 1. Initial Upload Screen
![Upload Interface](screenshots/01-upload-screen.png)
*Clean, intuitive drag-and-drop interface for uploading book cover images*

### 2. Image Preview & Extract
![Image Preview](screenshots/02-image-preview.png)
*Preview uploaded image and initiate AI analysis with the Extract Details button*

### 3. Verification Form
![Edit Form](screenshots/03-verification-form.png)
*Review and edit AI-extracted details before saving to inventory*

### 4. Complete Inventory View
![Inventory Grid](screenshots/04-inventory-view.png)
*Responsive grid layout displaying your complete book collection*

### 5. Search Functionality
![Search Feature](screenshots/05-search-feature.png)
*Real-time search with text highlighting for quick book discovery*

## �📱 How to Use

1. **Upload a Book Cover**: Drag and drop an image or click to select a JPG/PNG file of a book cover
2. **Preview**: Review the uploaded image in the preview section
3. **Extract Details**: Click "Extract Details" to let AI analyze the book cover
4. **Verify & Edit**: Review the AI-extracted information and make any necessary corrections
5. **Save to Inventory**: Click "Save to Inventory" to add the book to your collection
6. **Browse & Search**: View your complete inventory and use the search function to find specific books

## 🔍 API Endpoints

- `POST /api/extract` - Extract book details from uploaded image
- `POST /api/books` - Save a new book to inventory
- `GET /api/books` - Retrieve all books from inventory

## 📁 Project Structure

```
book-inventory-builder/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── books/
│   │   │   │   └── route.ts          # Book CRUD operations
│   │   │   └── extract/
│   │   │       └── route.ts          # AI image processing
│   │   ├── globals.css               # Global styles
│   │   ├── layout.tsx                # Root layout
│   │   └── page.tsx                  # Main application page
│   └── lib/
│       └── mongodb.ts                # MongoDB connection utility
├── public/                           # Static assets
├── .env.sample                       # Environment variables template
├── .env.local                        # Your environment variables (git-ignored)
├── next.config.ts                    # Next.js configuration
├── package.json                      # Dependencies and scripts
├── tailwind.config.ts               # Tailwind CSS configuration
└── README.md                        # Project documentation
```

## 🚀 Deployment

This project is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel's dashboard
4. Deploy automatically

## 🤝 Contributing

This project was built as part of a learning exercise. Feel free to fork and extend it with additional features like:

- User authentication
- Book categories and tags
- Export functionality
- Barcode scanning
- Advanced inventory analytics

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Google AI for providing the Gemini Vision API
- MongoDB Atlas for database services
- Next.js team for the excellent framework
- Tailwind CSS for the utility-first styling approach
