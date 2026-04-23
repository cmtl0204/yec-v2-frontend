import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {environment} from '@env/environment';
import {Observable} from 'rxjs';
import {CreateUserDto, UpdateUserDto, UserModel} from '@models/auth';
import {map} from 'rxjs/operators';
import {ServerResponse} from '@models/http-response';
import {MessageService} from '@services/core';
import {CatalogueModel, PaginatorModel} from '@models/core';
import {CatalogueTypeEnum} from "@utils/enums";

@Injectable({
  providedIn: 'root'
})
export class CataloguesHttpService {
  API_URL = `${environment.API_URL}/catalogues`;

  constructor(private httpClient: HttpClient,
              private messageService: MessageService) {
  }

  create(payload: CreateUserDto): Observable<UserModel> {
    const url = `${this.API_URL}`;
    return this.httpClient.post<ServerResponse>(url, payload).pipe(
      map(response => {
        this.messageService.success(response);
        return response.data;
      })
    );
  }

  findAll(page: number = 1, search: string = ''): Observable<CatalogueModel[]> {
    const url = this.API_URL;
    const headers = new HttpHeaders().append('pagination', 'true');
    const params = new HttpParams().append('page', page).append('search', search);

    return this.httpClient.get<ServerResponse>(url, {headers, params}).pipe(
      map(response => {
        // if (response.pagination) {
        //   this.pagination.next(response.pagination);
        // }
        return response.data;
      })
    );
  }

  findOne(id: string): Observable<UserModel> {
    const url = `${this.API_URL}/${id}`;
    return this.httpClient.get<ServerResponse>(url).pipe(
      map(response => response.data)
    );
  }

  update(id: string, payload: UpdateUserDto): Observable<UserModel> {
    const url = `${this.API_URL}/${id}`;
    return this.httpClient.put<ServerResponse>(url, payload).pipe(
      map(response => {
        this.messageService.success(response);
        return response.data;
      })
    );
  }

  remove(id: string): Observable<boolean> {
    const url = `${this.API_URL}/${id}`;
    return this.httpClient.delete<ServerResponse>(url).pipe(
      map(response => {
        this.messageService.success(response);
        return response.data;
      })
    );
  }

  removeAll(id: CatalogueModel[]): Observable<boolean> {
    const url = `${this.API_URL}/${id}`;
    return this.httpClient.delete<ServerResponse>(url).pipe(
      map(response => {
        this.messageService.success(response);
        return response.data;
      })
    );
  }

  findCache(): Observable<boolean> {
    const url = `${this.API_URL}/cache/get`;
    return this.httpClient.get<ServerResponse>(url).pipe(
      map(response => {
        sessionStorage.setItem('catalogues', JSON.stringify(response.data));
        return true;
      })
    );
  }

  findByType(type: CatalogueTypeEnum): CatalogueModel[] {
    const catalogues: CatalogueModel[] = JSON.parse(String(sessionStorage.getItem('catalogues')));

    return catalogues.filter(catalogue => catalogue.type === type && catalogue.isVisible);
  }
}
