import { importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter} from '@angular/router';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from 'src/app/interceptors/auth.interceptor'; // Ajusta la ruta según corresponda
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';


bootstrapApplication(AppComponent, {
  providers: [
    ScreenOrientation,
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    importProvidersFrom(
      IonicModule.forRoot({}),
      IonicStorageModule.forRoot(),
    )
  ]
});
