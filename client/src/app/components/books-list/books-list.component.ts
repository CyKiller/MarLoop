import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { BookService } from '../../services/book.service';
import { Book } from '../../models/book';

@Component({
  selector: 'app-books-list',
  templateUrl: './books-list.component.html',
  styleUrls: ['./books-list.component.css']
})
export class BooksListComponent implements OnInit {
  books$: Observable<Book[]>;

  constructor(private bookService: BookService) { }

  ngOnInit(): void {
    this.fetchBooks();
  }

  fetchBooks(): void {
    this.books$ = this.bookService.getBooks();
    this.books$.subscribe({
      next: (books) => console.log('Fetched books successfully', books),
      error: (error) => console.error('Error fetching books:', error.message, error)
    });
  }
}