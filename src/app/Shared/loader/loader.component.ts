import { Component } from '@angular/core';
import { LoadingService } from '../../services/LoadingService';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss'
})
export class LoaderComponent {
  constructor(public loadingService: LoadingService) {}
}
