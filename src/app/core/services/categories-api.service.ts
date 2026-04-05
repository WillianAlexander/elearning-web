import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClient } from './api-client.service';

export interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  children?: Category[];
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  parentId?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoriesApiService {
  private readonly api = inject(ApiClient);

  /**
   * Get all categories (tree structure)
   */
  list(): Observable<Category[]> {
    return this.api.get<Category[]>('/categories');
  }

  /**
   * Get category by ID
   */
  getById(id: string): Observable<Category> {
    return this.api.get<Category>(`/categories/${id}`);
  }

  /**
   * Create a new category
   */
  create(data: CreateCategoryPayload): Observable<Category> {
    return this.api.post<Category>('/categories', data);
  }

  /**
   * Update a category
   */
  update(id: string, data: UpdateCategoryPayload): Observable<Category> {
    return this.api.put<Category>(`/categories/${id}`, data);
  }

  /**
   * Delete a category
   */
  delete(id: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/categories/${id}`);
  }
}
