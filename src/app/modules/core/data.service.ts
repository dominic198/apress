import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "angularfire2/firestore";
import { Observable, throwError, BehaviorSubject } from "rxjs";
import { catchError, tap, map, switchMap } from "rxjs/operators";
import { AuthService } from "./auth.service";

interface Note {
  id: string;
  title: string;
  content: string;
}

interface Joke {
  id: string;
  joke: string;
  status: number;
}

@Injectable({
  providedIn: "root"
})
export class DataService {
  protected readonly USERS_COLLECTION = "users";
  protected readonly NOTES_COLLECTION = "notes";
  protected readonly FIRESTORE_ENDPOINT =
    'https://firestore.googleapis.com/v1beta1/projects/awesome-project-a1a25/databases/(default)/documents/';
  protected readonly DAD_JOKE = 'https://icanhazdadjoke.com';

  public isLoading$ = new BehaviorSubject<boolean>(true);

  get timestamp() {
    return new Date().getTime();
  }

  constructor(private afDb: AngularFirestore, private auth: AuthService, private http: HttpClient) {}

  getUserNotesCollection() {
    return this.afDb.collection(
      this.USERS_COLLECTION + "/" + this.auth.id + "/" + this.NOTES_COLLECTION,
      ref => ref.orderBy("updated_at", "desc")
    );
  }

  addNote(data): Promise<DocumentReference> {
    return this.getUserNotesCollection().add({
      ...data,
      created_at: this.timestamp,
      updated_at: this.timestamp
    });
  }

  editNote(id, data): Promise<void> {
    return this.getUserNotesCollection()
      .doc(id)
      .update({
        ...data,
        updated_at: this.timestamp
      });
  }

  deleteNote(id): Promise<void> {
    return this.getUserNotesCollection()
      .doc(id)
      .delete();
  }

  getNote(id): Observable<any> {
    return this.getUserNotesCollection()
      .doc(id)
      .snapshotChanges()
      .pipe(
        map(snapshot => {
          const data = snapshot.payload.data() as Note;
          const id = snapshot.payload.id;
          return { id, ...data };
        }),
        catchError(e => throwError(e))
      );
  }

  getNotes(): Observable<any> {
    return this.getUserNotesCollection()
      .snapshotChanges()
      .pipe(
        map(snapshot =>
          snapshot.map(a => {
            //Get document data
            const data = a.payload.doc.data() as Note;
            //Get document id
            const id = a.payload.doc.id;
            //Use spread operator to add the id to the document data
            return { id, ...data };
          })
        ),
        tap(notes => {
          this.isLoading$.next(false);
        }),
        catchError(e => throwError(e))
      );
  }

  getRandomDadJoke(): Observable<string> {
    return this.http
      .get<Joke>(this.DAD_JOKE, {
        headers: {
          Accept: 'application/json'
        }
      })
      .pipe(map(data => data.joke));
  }

  getNoteFromDirectApi(id): Observable<any> {
    return this.auth.getToken().pipe(
      switchMap(idToken => {
        return this.http.get(
          `${this.FIRESTORE_ENDPOINT}users/${this.auth.id}/notes/${id}`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`
            }
          }
        );
      }),
      map(notes => this.transformNote(notes))
    );
  }

  private transformNotes(notes) {
    return notes.map(note => this.transformNote(note));
  }

  private transformNote(note) {
    const _note = {};
    _note['id'] = note.name.split('/').reverse()[0];
    for (const prop in note.fields) {
      if (note.fields[prop]) {
        _note[prop] =
          note.fields[prop]['stringValue'] || note.fields[prop]['integerValue'];
      }
    }
    return _note;
  }

  initializeNotes(): Observable<any> {
    return this.auth.getToken().pipe(
      switchMap(idToken => {
        return this.http.get(
          `${this.FIRESTORE_ENDPOINT}users/${this.auth.id}/notes`,
          {
            headers: {
              Authorization: `Bearer ${idToken}`
            }
          }
        );
      }),
      map((data: { documents: { fields: {} }[] }) => data.documents),
      map(notes => this.transformNotes(notes)),
      tap(notes => {
        this.isLoading$.next(false);
      })
    );
  }
}
