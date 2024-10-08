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
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { AddCalendarComponent } from './add-calendar/add-calendar.component';
import { CalendarComponent } from './calendar/calendar.component';


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
  { path: 'task/:id', component: TaskDetailComponent },
  { path: 'add/calendar', component: AddCalendarComponent },
  { path: 'calendar', component: CalendarComponent },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },  // Redirect to login if no path
  { path: '**', redirectTo: '/dashboard' }  // Wildcard route for invalid URLs
];
