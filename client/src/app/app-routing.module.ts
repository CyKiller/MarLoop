import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { BooksListComponent } from './components/books-list/books-list.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component'; // Ensure this component is created and imported correctly

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'books', component: BooksListComponent },
  { path: 'user/profile', component: UserProfileComponent } // Ensure the UserProfileComponent is correctly implemented
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }