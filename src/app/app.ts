import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeToggleComponent } from '@components/theme-toggle/theme-toggle';
import { ConfigService } from '@services/config.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ThemeToggleComponent, ToastModule],
  providers: [MessageService],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private configService = inject(ConfigService);
  // Señales para configuración reactiva
  protected readonly title = signal(this.configService.getAppName());
  protected readonly version = signal(this.configService.getAppVersion());
  protected readonly isProduction = signal(this.configService.isProduction());
  protected readonly environment = signal(this.configService.getEnvironmentName());

  constructor() {}
}
