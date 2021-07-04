import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirebaseAuthService } from "./firebase-auth-service.service";
import { SnackBarService } from "./snack-bar.service";

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
  ],
  providers: [FirebaseAuthService, SnackBarService]
})
export class CoreModule {
  constructor(
    @Optional()
    @SkipSelf()
    parentModule: CoreModule
  ) {
    if (parentModule) {
      throw new Error(
        `CoreModule has already been loaded. Import Core modules in the AppModule only.`
      );
    }
  }
}
