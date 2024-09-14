import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';  // Import RouterModule for standalone components

@Component({
  selector: 'app-root',
  standalone: true,  // Declare that this is a standalone component
  imports: [RouterModule],  // Import RouterModule here
  template: `<router-outlet></router-outlet>`,  // Add your router-outlet here
})
export class AppComponent {}
