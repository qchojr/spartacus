import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { Config, ConfigModule } from '../config/config.module';
import { AuthConfig } from './config/auth-config';
import { defaultAuthConfig } from './config/default-auth-config';
import { interceptors } from './http-interceptors/index';
import { OccUserIdModule } from './occ-user-id/occ-user-id.module';
import { AuthServices } from './services/index';
import { AuthStoreModule } from './store/auth-store.module';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    AuthStoreModule,
    OccUserIdModule,
    ConfigModule.withConfig(defaultAuthConfig),
  ],
})
export class AuthModule {
  static forRoot(): ModuleWithProviders<AuthModule> {
    return {
      ngModule: AuthModule,
      providers: [
        ...interceptors,
        ...AuthServices,
        { provide: AuthConfig, useExisting: Config },
      ],
    };
  }
}
