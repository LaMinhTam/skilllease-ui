// src/app/components/shared/shared-components.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingComponent } from './rating/rating.component';

@NgModule({
  imports: [
    CommonModule,
    RatingComponent
  ],
  exports: [
    RatingComponent
  ]
})
export class SharedComponentsModule { }