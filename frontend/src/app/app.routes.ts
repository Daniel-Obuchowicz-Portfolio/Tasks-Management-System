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
import { AuthGuard } from './auth.guard';


export const appRoutes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'users', component: UsersComponent, canActivate: [AuthGuard] },
  { path: 'user/:id', component: UserDetailsComponent, canActivate: [AuthGuard] },
  { path: 'add/user', component: AddUserComponent, canActivate: [AuthGuard] },
  { path: 'edit/user/:id', component: EditUserComponent, canActivate: [AuthGuard] },
  { path: 'tasks', component: TaskListComponent, canActivate: [AuthGuard] },
  { path: 'add/task', component: AddTaskComponent, canActivate: [AuthGuard] },
  { path: 'edit/task/:id', component: EditTaskComponent, canActivate: [AuthGuard] },
  { path: 'task/:id', component: TaskDetailComponent, canActivate: [AuthGuard] },
  { path: 'add/calendar', component: AddCalendarComponent, canActivate: [AuthGuard] },
  { path: 'calendar', component: CalendarComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
