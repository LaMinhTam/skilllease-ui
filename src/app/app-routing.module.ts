// src/app/app-routing.module.ts
import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { EmployerJobsComponent } from './pages/employer/employer-jobs/employer-jobs.component';
import { EmployerJobBidsComponent } from './pages/employer/employer-job-bids/employer-job-bids.component';
import { PostJobComponent } from './pages/post-job/post-job.component';
import { EditJobComponent } from './pages/edit-job/edit-job.component';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { ToastService } from './services/toast.service';
import { FreelancerBidComponent } from './pages/freelancer-bid/freelancer-bid.component';
import { CreateContractComponent } from './pages/create-contract/create-contract.component';
import { MyContractsComponent } from './pages/my-contracts/my-contracts.component';
import { ContractDetailComponent } from './pages/contract-detail/contract-detail.component';
import { MilestoneDashboardComponent } from './pages/milestone-dashboard/milestone-dashboard.component';

// Functional auth guard for standalone components
const authGuard = (route: any, state: any) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);
  
  const user = authService.currentUserValue;
  
  if (user) {
    // Check if route has role requirement
    if (route.data['roles'] && !route.data['roles'].includes(user.role)) {
      toastService.error('You do not have permission to access this page');
      router.navigate(['/']);
      return false;
    }
    
    // Logged in, so return true
    return true;
  }

  // Not logged in, redirect to login page with returnUrl
  toastService.error('You need to login first');
  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};

// Role-specific guard for employer routes
const employerGuard = (route: any, state: any) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);
  
  const user = authService.currentUserValue;
  
  if (user && user.role === 'EMPLOYER') {
    return true;
  }
  
  toastService.error('Only employers can access this page');
  router.navigate(['/']);
  return false;
};

// Functional auth guard for freelancers
const freelancerGuard = (route: any, state: any) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);
  
  const user = authService.currentUserValue;
  
  if (user && user.role === 'FREELANCER') {
    return true;
  }
  
  toastService.error('Only freelancers can access this page');
  router.navigate(['/']);
  return false;
};

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent, 
    canActivate: [() => authGuard] 
  },
  { 
    path: 'employer-jobs', 
    component: EmployerJobsComponent, 
    canActivate: [() => authGuard, () => employerGuard] 
  },
  { 
    path: 'job-bids/:id', 
    component: EmployerJobBidsComponent, 
    canActivate: [() => authGuard, () => employerGuard] 
  },
  { 
    path: 'bid/:id', 
    component: FreelancerBidComponent, 
    canActivate: [() => authGuard, () => freelancerGuard] 
  },
  { 
    path: 'post-job', 
    component: PostJobComponent, 
    canActivate: [() => authGuard, () => employerGuard] 
  },
  { 
    path: 'edit-job/:id', 
    component: EditJobComponent, 
    canActivate: [() => authGuard, () => employerGuard] 
  },
  { 
    path: 'create-contract/:id', 
    component: CreateContractComponent,
    canActivate: [() => authGuard, () => employerGuard] 
  },
  { 
    path: 'my-contracts', 
    component: MyContractsComponent, 
    canActivate: [() => authGuard] 
  },
  { 
    path: 'contract/:id', 
    component: ContractDetailComponent, // Replace with actual component when ready 
    canActivate: [() => authGuard] 
  },
  { 
    path: 'contract/:id/milestones', 
    component: MilestoneDashboardComponent, // Replace with actual component when ready 
    canActivate: [() => authGuard] 
  },
  { 
    path: 'profile/:id', 
    component: HomeComponent, // Replace with actual component when ready 
    canActivate: [() => authGuard] 
  },
  // Wildcard route for 404
  { path: '**', redirectTo: '' }
];