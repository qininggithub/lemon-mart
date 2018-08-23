import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InventoryRoutingModule } from './inventory-routing.module';
import { StockEntryComponent } from './stock-entry/stock-entry.component';
import { ProductsComponent } from './products/products.component';
import { CategoriesComponent } from './categories/categories.component';
import { InventoryComponent } from './inventory.component';
import { MaterialModule } from '../material.module';
import { InventoryHomeComponent } from './inventory-home/inventory-home.component';

@NgModule({
  imports: [
    CommonModule,
    InventoryRoutingModule,
    MaterialModule
  ],
  declarations: [
    StockEntryComponent,
    ProductsComponent,
    CategoriesComponent,
    InventoryComponent,
    InventoryHomeComponent
  ]
})
export class InventoryModule { }
