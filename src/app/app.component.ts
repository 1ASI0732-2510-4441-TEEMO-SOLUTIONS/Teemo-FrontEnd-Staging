import { Component } from "@angular/core"
import { RouterOutlet } from "@angular/router"
import { AuthService } from "./services/auth.service" // Regular import, not type-only

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="app-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [
    `
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
  `,
  ],
})
export class AppComponent {
  title = "FrontEndTeemo"

  constructor(private authService: AuthService) {}
}
