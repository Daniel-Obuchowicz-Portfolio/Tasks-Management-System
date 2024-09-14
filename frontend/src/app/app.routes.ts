import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { UsersComponent } from './users/users.component';
import { UserDetailsComponent } from './users-details/users-details.component';
import { AddUserComponent } from './add-user/add-user.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { TaskListComponent } from './task-list/task-list.component';
import { AddTaskComponent } from './add-task/add-task.component';
import { EditTaskComponent } from './edit-task/edit-task.component';


export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'users', component: UsersComponent },
  { path: 'user/:id', component: UserDetailsComponent },
  { path: 'add/user', component: AddUserComponent },
  { path: 'edit/user/:id', component: EditUserComponent },
  { path: 'tasks', component: TaskListComponent },
  { path: 'add/task', component: AddTaskComponent },
  { path: 'edit/task/:id', component: EditTaskComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },  // Redirect to login if no path
  { path: '**', redirectTo: '/login' }  // Wildcard route for invalid URLs
];
