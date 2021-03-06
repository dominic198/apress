import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from './modules/core/data.service';
import { SwUpdate, UpdateActivatedEvent, UpdateAvailableEvent } from '@angular/service-worker';
import { SnackBarService } from './modules/core/snack-bar.service';
//import { UpdateActivatedEvent, UpdateAvailableEvent } from '@angular/service-worker/src/low_level';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'lovely-offline';
  joke$: Observable<string>;
  constructor(private db: DataService, private swUpdates: SwUpdate, private snackbar: SnackBarService){}
    ngOnInit() {
    this.joke$ = this.db.getRandomDadJoke();
    this.swUpdateFlow();
    }

    swUpdateFlow() {
      // check if service worker is enabled and only check if it's production
      if (this.swUpdates.isEnabled && environment.production) {
        // subscribe to recieve update when it's available
        this.swUpdates.available.subscribe((event: UpdateAvailableEvent) => {
          // console log version on appData Object defined in ngsw-config.js
          console.log(`Version: ${event.current.appData['version']}`);
  
          // an update is available, inform user and take an action
          this.snackbar
            .action(
              `${event.type}: current is ${event.current.hash} but available is ${event.available.hash}`,
              'Activate'
            )
            .subscribe(() => {
              // force to activate update
              this.swUpdates
                .activateUpdate()
                .then(() => {
                  this.snackbar.open('Update has been applied', 1000);
                  // force to reload to ensure new update is in place
                  // (<any>window).location.reload();
                })
                .catch(e => {
                  this.snackbar.open('Something is wrong, please reload manually');
                });
            });
        });
  
        // subscribe to receive an notification when new version is activated
        this.swUpdates.activated.subscribe((event: UpdateActivatedEvent) => {
          // console log version on appData Object defined in ngsw-config.js
          console.log(`Version: ${event.current.appData['version']}`);
  
          this.snackbar
            .action(`${event.type}, current is ${event.current.hash} but previously was ${event.previous.hash}`, 'Reload')
            .subscribe(() => {
              // force to reload to ensure new update is in place
              (<any>window).location.reload();
            });
        });
      }
   }
  }   
