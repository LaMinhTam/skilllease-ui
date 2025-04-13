// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';

// Components
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { LayoutComponent } from './components/layout/layout.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';

// Services
import { AuthService } from './services/auth.service';
import { ApiService } from './services/api.service';
import { ToastService } from './services/toast.service';

// Interceptors
import { AuthInterceptor } from './interceptors/auth.interceptor';

// Routes
import { routes } from './app-routing.module';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    
    // Import standalone components
    AppComponent,
    HeaderComponent,
    FooterComponent,
    LayoutComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent
  ],
  providers: [
    AuthService,
    ApiService,
    ToastService,
    provideRouter(routes),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }