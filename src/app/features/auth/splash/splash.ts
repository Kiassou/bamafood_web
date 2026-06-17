import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [],
  templateUrl: './splash.html',
  styleUrls: ['./splash.css']
})

export class SplashComponent implements OnInit {

  constructor(private router: Router) {}

  ngOnInit(): void {

    setTimeout(() => {

      this.router.navigate(['/login']);

    }, 6000);

  }

}