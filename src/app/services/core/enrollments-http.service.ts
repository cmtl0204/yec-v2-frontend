import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {environment} from '@env/environment';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {
  CreateInstitutionDto,
  UpdateInstitutionDto,
  InstitutionModel,
  CreateEnrollmentDto,
  EnrollmentModel,
  UpdateEnrollmentDto,
  SelectEnrollmentDto, EnrollmentDetailModel, FileModel, CareerModel, SchoolPeriodModel, StudentModel
} from '@models/core';
import {ServerResponse} from '@models/http-response';
import {CoreService, MessageService} from "@services/core";
import {format} from "date-fns";
import {AuthService} from "@services/auth";

@Injectable({
  providedIn: 'root'
})
export class EnrollmentsHttpService {
  API_URL = `${environment.API_URL}/enrollments`;

  constructor(private coreService: CoreService,
              private httpClient: HttpClient,
              private messageService: MessageService,) {
  }

  create(payload: CreateEnrollmentDto): Observable<EnrollmentModel> {
    const url = `${this.API_URL}`;

    this.coreService.isProcessing = true;
    return this.httpClient.post<ServerResponse>(url, payload).pipe(
      map((response) => {
        this.coreService.isProcessing = false;
        this.messageService.success(response);
        return response.data;
      })
    );
  }

  find(page: number = 0, search: string = ''): Observable<ServerResponse> {
    const url = this.API_URL;

    const headers = new HttpHeaders().append('pagination', 'true');
    const params = new HttpParams()
      .append('page', page)
      .append('search', search);

    return this.httpClient.get<ServerResponse>(url, {headers, params}).pipe(
      map((response) => {
        return response;
      })
    );
  }

  findEnrollmentDetailsByEnrollment(id: string): Observable<EnrollmentDetailModel[]> {
    const url = `${this.API_URL}/${id}/enrollment-details`;

    return this.httpClient.get<ServerResponse>(url).pipe(
      map((response) => {
        return response.data;
      })
    );
  }

  findAll(page: number = 0, search: string = ''): Observable<ServerResponse> {
    const url = this.API_URL;

    const headers = new HttpHeaders().append('pagination', 'true');
    const params = new HttpParams()
      .append('page', page)
      .append('search', search);

    return this.httpClient.get<ServerResponse>(url, {headers, params}).pipe(
      map((response) => {
        return response;
      })
    );
  }

  findOne(id: string): Observable<EnrollmentModel> {
    const url = `${this.API_URL}/${id}`;

    return this.httpClient.get<ServerResponse>(url).pipe(
      map(response => {
        return response.data;
      })
    );
  }

  update(id: string, payload: SelectEnrollmentDto): Observable<EnrollmentModel> {
    const url = `${this.API_URL}/${id}`;

    this.coreService.isProcessing = true;

    return this.httpClient.put<ServerResponse>(url, payload).pipe(
      map(response => {
        this.coreService.isProcessing = false;
        this.messageService.success(response);
        return response.data;
      })
    );
  }

  updateApproved(id: string, payload: SelectEnrollmentDto): Observable<EnrollmentModel> {
    const url = `${this.API_URL}/${id}/approved`;

    this.coreService.isProcessing = true;

    return this.httpClient.put<ServerResponse>(url, payload).pipe(
      map(response => {
        this.coreService.isProcessing = false;
        this.messageService.success(response);
        return response.data;
      })
    );
  }

  updateEnrolled(id: string, payload: SelectEnrollmentDto): Observable<EnrollmentModel> {
    const url = `${this.API_URL}/${id}/enrolled`;

    this.coreService.isProcessing = true;

    return this.httpClient.put<ServerResponse>(url, payload).pipe(
      map(response => {
        this.coreService.isProcessing = false;
        this.messageService.success(response);
        return response.data;
      })
    );
  }

  reactivate(id: string): Observable<EnrollmentModel> {
    const url = `${this.API_URL}/${id}/reactivate`;

    return this.httpClient.put<ServerResponse>(url, null).pipe(
      map((response) => {
        this.messageService.success(response);
        return response.data;
      })
    );
  }

  remove(id: string): Observable<EnrollmentModel> {
    const url = `${this.API_URL}/${id}`;

    return this.httpClient.delete<ServerResponse>(url).pipe(
      map((response) => {
        this.messageService.success(response);
        return response.data;
      })
    );
  }

  removeAll(institutions: EnrollmentModel[]): Observable<EnrollmentModel[]> {
    const url = `${this.API_URL}/remove-all`;

    return this.httpClient.patch<ServerResponse>(url, institutions).pipe(
      map((response) => {
        this.messageService.success(response);
        return response.data;
      })
    );
  }

  hide(id: string): Observable<EnrollmentModel> {
    const url = `${this.API_URL}/${id}/hide`;

    return this.httpClient.patch<ServerResponse>(url, null).pipe(
      map((response) => {
        this.messageService.success(response);
        return response.data;
      })
    );
  }

  approve(id: string): Observable<EnrollmentModel> {
    const url = `${this.API_URL}/${id}/approve`;

    return this.httpClient.patch<ServerResponse>(url, null).pipe(
      map((response) => {
        this.messageService.success(response);
        return response.data;
      })
    );
  }

  reject(id: string): Observable<EnrollmentModel> {
    const url = `${this.API_URL}/${id}/reject`;

    return this.httpClient.patch<ServerResponse>(url, null).pipe(
      map((response) => {
        this.messageService.success(response);
        return response.data;
      })
    );
  }

  enroll(id: string): Observable<EnrollmentModel> {
    const url = `${this.API_URL}/${id}/enroll`;

    return this.httpClient.patch<ServerResponse>(url, null).pipe(
      map((response) => {
        this.messageService.success(response);
        return response.data;
      })
    );
  }

  revoke(id: string): Observable<EnrollmentModel> {
    const url = `${this.API_URL}/${id}/revoke`;

    return this.httpClient.patch<ServerResponse>(url, null).pipe(
      map((response) => {
        this.messageService.success(response);
        return response.data;
      })
    );
  }

  sendRegistration(payload: any): Observable<EnrollmentModel> {
    const url = `${this.API_URL}/send-registration`;

    return this.httpClient.post<ServerResponse>(url, payload).pipe(
      map((response) => {
        this.messageService.success(response);
        return response.data;
      })
    );
  }

  sendRequest(id: string, payload: any): Observable<EnrollmentModel> {
    const url = `${this.API_URL}/${id}/send-request`;

    return this.httpClient.post<ServerResponse>(url, payload).pipe(
      map((response) => {
        this.messageService.success(response);
        return response.data;
      })
    );
  }

  downloadEnrollmentCertificate(id: string,identification:string) {
    const url = `${environment.API_URL}/enrollment-reports/${id}/certificate`;
    this.coreService.isProcessing = true;
    this.httpClient.get<BlobPart>(url, {responseType: 'blob' as 'json'})
      .subscribe(response => {
        // const filePath = URL.createObjectURL(new Blob(binaryData, {type: file.extension}));
        const filePath = URL.createObjectURL(new Blob([response]));
        const downloadLink = document.createElement('a');
        downloadLink.href = filePath;
        const fileName = 'Certificado_Matricula_' + identification;
        downloadLink.setAttribute('download', fileName + '.pdf');
        document.body.appendChild(downloadLink);
        downloadLink.click();
        this.coreService.isProcessing = false;
      });
  }

  downloadEnrollmentAcademicRecord(student:StudentModel) {
    const url = `${environment.API_URL}/enrollment-reports/academic-records/${student.id}`;
    this.coreService.isProcessing = true;
    this.httpClient.get<BlobPart>(url, {responseType: 'blob' as 'json'})
      .subscribe(response => {
        // const filePath = URL.createObjectURL(new Blob(binaryData, {type: file.extension}));
        const filePath = URL.createObjectURL(new Blob([response]));
        const downloadLink = document.createElement('a');
        downloadLink.href = filePath;
        const fileName = 'Record_Academico_' + student.user.identification;
        downloadLink.setAttribute('download', fileName + '.pdf');
        document.body.appendChild(downloadLink);
        downloadLink.click();
        this.coreService.isProcessing = false;
      });
  }

  downloadPaymentOrder(id: string,identification:string) {
    const url = `${environment.API_URL}/student-reports/${id}/payment-order`;
    this.coreService.isProcessing = true;
    this.httpClient.get<BlobPart>(url, {responseType: 'blob' as 'json'})
      .subscribe(response => {
        // const filePath = URL.createObjectURL(new Blob(binaryData, {type: file.extension}));
        const filePath = URL.createObjectURL(new Blob([response]));
        const downloadLink = document.createElement('a');
        downloadLink.href = filePath;
        const fileName = 'Certificado_Matricula_' + identification;
        downloadLink.setAttribute('download', fileName + '.pdf');
        document.body.appendChild(downloadLink);
        downloadLink.click();
        this.coreService.isProcessing = false;
      });
  }

  downloadEnrollmentsByCareer(career: CareerModel, schoolPeriodId: string) {
    const url = `${environment.API_URL}/enrollment-reports/careers/${career.id}`;

    const params = new HttpParams().append('schoolPeriodId', schoolPeriodId);

    this.coreService.isProcessing = true;

    this.httpClient.get<BlobPart>(url, {params, responseType: 'blob' as 'json'})
      .subscribe(response => {
        const currentDate = format(new Date(), 'yyyy_MM_dd_H_m_s');
        const filePath = URL.createObjectURL(new Blob([response]));
        const downloadLink = document.createElement('a');
        downloadLink.href = filePath;
        downloadLink.setAttribute('download', `Matriculados_${career.acronym}_${currentDate}.xlsx`);
        document.body.appendChild(downloadLink);
        downloadLink.click();
        this.coreService.isProcessing = false;
      });
  }

  downloadEnrollmentsBySchoolPeriod(schoolPeriod: SchoolPeriodModel) {
    const url = `${environment.API_URL}/enrollment-reports/school-periods/${schoolPeriod.id}`;

    this.coreService.isProcessing = true;

    this.httpClient.get<BlobPart>(url, { responseType: 'blob' as 'json'})
      .subscribe(response => {
        const currentDate = format(new Date(), 'yyyy_MM_dd_H_m_s');
        const filePath = URL.createObjectURL(new Blob([response]));
        const downloadLink = document.createElement('a');
        downloadLink.href = filePath;
        downloadLink.setAttribute('download', `Matriculados_${schoolPeriod.codeSniese}_${currentDate}.xlsx`);
        document.body.appendChild(downloadLink);
        downloadLink.click();
        this.coreService.isProcessing = false;
      });
  }

  generateEnrollmentAplication(id: string): Observable<any> {
    const url = `${environment.API_URL}/enrollment-reports/${id}/application`;

    this.coreService.isProcessing = true;

    return this.httpClient.get<BlobPart>(url, {responseType: 'blob' as 'json'}).pipe(
      map((response) => {
        this.coreService.isProcessing = false;
        return response;
      })
    );
  }

  downloadEnrollmentDetailsBySchoolPeriod(schoolPeriod: SchoolPeriodModel) {
    const url = `${environment.API_URL}/enrollment-reports/enrollment-details/${schoolPeriod.id}`;

    this.coreService.isProcessing = true;

    this.httpClient.get<BlobPart>(url, { responseType: 'blob' as 'json'})
      .subscribe(response => {
        const currentDate = format(new Date(), 'yyyy_MM_dd_H_m_s');
        const filePath = URL.createObjectURL(new Blob([response]));
        const downloadLink = document.createElement('a');
        downloadLink.href = filePath;
        downloadLink.setAttribute('download', `Asignturas_Matriculadas_${schoolPeriod.codeSniese}_${currentDate}.xlsx`);
        document.body.appendChild(downloadLink);
        downloadLink.click();
        this.coreService.isProcessing = false;
      });
  }
}
