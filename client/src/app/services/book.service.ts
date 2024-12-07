import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Book } from '../models/book';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = '/api/books';

  constructor(private http: HttpClient) {
    console.log('BookService initialized');
  }

  getBooks(): Observable<Book[]> {
    console.log('Fetching all books');
    return this.http.get<Book[]>(this.apiUrl);
  }

  getBook(id: string): Observable<Book> {
    console.log(`Fetching book with id: ${id}`);
    return this.http.get<Book>(`${this.apiUrl}/${id}`);
  }

  createBook(book: Book): Observable<Book> {
    console.log('Creating a new book', book);
    return this.http.post<Book>(this.apiUrl, book, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      catchError(error => {
        console.error('Error creating book:', error.message, error);
        throw error;
      })
    );
  }

  updateBook(id: string, book: Book): Observable<Book> {
    console.log(`Updating book with id: ${id}`, book);
    return this.http.put<Book>(`${this.apiUrl}/${id}`, book, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(
      catchError(error => {
        console.error('Error updating book:', error.message, error);
        throw error;
      })
    );
  }

  deleteBook(id: string): Observable<{}> {
    console.log(`Deleting book with id: ${id}`);
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Error deleting book:', error.message, error);
        throw error;
      })
    );
  }
}