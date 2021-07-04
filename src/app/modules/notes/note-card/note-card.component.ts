import { Input } from '@angular/core';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-note-card',
  templateUrl: './note-card.component.html',
  styleUrls: ['./note-card.component.scss']
})
export class NoteCardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @Input()
  note;

  @Input()
  loading;

  @Input()
  edit = true;
}
