import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';
import { ThreeModelViewComponent } from './three-model-view/three-model-view.component';
import { saveAs } from 'file-saver';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatCardModule,
    ThreeModelViewComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  @ViewChildren('3dView') elementsToObserve!: QueryList<ThreeModelViewComponent>;
  isFullscreen: boolean = false;
  showCard: boolean = true;
  files = [{
    name: 'KHAI.glb',
    title: '',
    subTitle: '3D-модель студмістечка Харківського Національного аерокосмічного університету ім. М.Є. Жуквсього "ХАІ"'
  }, {
    name: 'ULK_KHAI.glb',
    title: '',
    subTitle: '3D-модель навчально-лабораторного корпуску Харківського Національного аерокосмічного університету ім. М.Є. Жуквсього "ХАІ"'
  }]
  currentIndex = 0;
  totalLoaded = 0;
  loadedFiles: number[] = []
  constructor() {

  }

  ngAfterViewInit(): void {
    const carousel = document.getElementById('3d-models-carousel');
    if (carousel) {
      carousel.addEventListener('slid.bs.carousel', (event: any) => {
        this.currentIndex = event.to;
      });
    }
  }


  onModelLoaded(index: number) {
    if (!this.loadedFiles.includes(index)) {
      this.totalLoaded++;
      this.loadedFiles.push(index);
    }
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.files.length;
  }

  prevSlide() {
    this.currentIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.files.length - 1;
  }

  toggleFullscreen(): void {
    this.showCard = false; // Hide the card momentarily to expand it
    this.isFullscreen = !this.isFullscreen;
    setTimeout(() => {
      this.showCard = true;
    })
  }

  getLoadedPercent(): number {
    return this.totalLoaded / this.files.length * 100;
  }

  onDownloadArchiveClick() {
    fetch('assets/archives/KHAI.kmz')
      .then((response) => response.blob())
      .then((blob) => {
        saveAs(blob, 'KHAI.kmz');
      })
      .catch((error) => {
        console.error('Error fetching the file:', error);
      });
  }
}



export interface Tile {
  color: string;
  cols: number;
  rows: number;
  text: string;
}
