import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common'; // Added to resolve NG8103 warning

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FlexLayoutModule,
    CommonModule // Added to allow the use of *ngIf and other common directives
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }