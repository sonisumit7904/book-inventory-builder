// src/app/api/books/route.ts
import clientPromise from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const book = await request.json();
    
    // Basic validation
    if (!book.title || !book.author) {
      return NextResponse.json({ error: "Title and Author are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("bookInventoryDB");
    const result = await db.collection("books").insertOne({
      ...book,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ 
      message: "Book saved successfully", 
      bookId: result.insertedId 
    }, { status: 201 });

  } catch (error) {
    console.error("Failed to save book:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("bookInventoryDB");
    const books = await db.collection("books").find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(books);
  } catch (error) {
    console.error("Failed to fetch books:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
