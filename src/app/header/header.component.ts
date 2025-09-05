import { Component } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { PatchNotesService } from "../patch-notes/patch-notes.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  imports: [RouterLink, RouterLinkActive]
})
export class HeaderComponent {
  constructor(private patchNotes: PatchNotesService) {}

  openPatchNotes() {
    this.patchNotes.open();
  }
}
