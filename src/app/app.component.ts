import { Component, signal, WritableSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AutocompleteComponent } from "./components/autocomplete/autocomplete.component";
import { delay, of } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [AutocompleteComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  fagList = [
    { text: 'Martin Sosa', other: 'other' },
    { text: 'Ernesto Cervantes', other: 'other2' },
    { text: 'Ernesto Sosa', other: 'other3' },
    { text: 'Martin Cervantes', other: 'other4' }
  ];

  fagListFromBackend: WritableSignal<{ text: string, [key: string]: any }[]> = signal([]);

  shouldShowIcon = signal(false);

  onInput(event: { event: Event, text: string }) {
    if (event.text.length >= 2) {
      this.shouldShowIcon.set(true);
      this.filterList(event.text).subscribe((list) => {
        this.shouldShowIcon.set(false);
        this.fagListFromBackend.set(list);
      });
    }
  }

  filterList(text: string) {
    return of(this.fagList).pipe(delay(1000));
  }
}
