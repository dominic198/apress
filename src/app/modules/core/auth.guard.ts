import { Injectable } from "@angular/core";
import { Router, CanLoad } from "@angular/router";
import { AuthService } from "./auth.service";
import { Observable, of } from "rxjs";
import { map, take, tap } from "rxjs/operators";

@Injectable()
export class AuthGuard implements CanLoad {
  constructor(private auth: AuthService, private router: Router) {}

  canLoad(): Observable<boolean> { 
    // console.log(this.auth.authenticated)   
    // if (!this.auth.authenticated) {
    //   this.router.navigate(["/user"]);
    //   return of(false);
    // }
    // this.router.navigate(['/notes']);
    // return of(true);

    return this.auth.authenticated
       .pipe(
         map (authState => !!authState),
         tap (auth => !auth ?  this.router.navigate(["/user"]) : true),
         take(1)
        )
  }
}