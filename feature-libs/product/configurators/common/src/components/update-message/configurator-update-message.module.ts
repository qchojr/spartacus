import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { CmsConfig, I18nModule, provideDefaultConfig } from '@spartacus/core';
import { SpinnerModule } from '@spartacus/storefront';
import { ConfiguratorUpdateMessageComponent } from './configurator-update-message.component';

@NgModule({
  imports: [CommonModule, SpinnerModule, I18nModule],
  providers: [
    provideDefaultConfig(<CmsConfig>{
      cmsComponents: {
        VariantConfigurationUpdateMessage: {
          component: ConfiguratorUpdateMessageComponent,
        },
      },
    }),
  ],
  declarations: [ConfiguratorUpdateMessageComponent],
  exports: [ConfiguratorUpdateMessageComponent],
  entryComponents: [ConfiguratorUpdateMessageComponent],
})
export class ConfiguratorUpdateMessageModule {}
