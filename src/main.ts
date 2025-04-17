import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter} from '@angular/router';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';
import { provideHttpClient } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    importProvidersFrom(
      IonicModule.forRoot({}),
      IonicStorageModule.forRoot(),
    )
  ]
});
