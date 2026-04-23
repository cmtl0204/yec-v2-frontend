import { Component, OnInit } from '@angular/core';
import { FormControl } from "@angular/forms";
import {ActivatedRoute, Router} from '@angular/router';
import { MenuItem, PrimeIcons } from "primeng/api";
import { ColumnModel, InstitutionModel, PaginatorModel, SelectEnrollmentDto, EnrollmentModel, SubjectModel, CareerModel, CatalogueModel, SchoolPeriodModel, SelectEnrollmentDetailDto, EnrollmentDetailModel } from '@models/core';
import {
  BreadcrumbService,
  CareersHttpService,
  CareersService,
  CataloguesHttpService,
  CoreService,
  EnrollmentsHttpService,
  MessageService,
  RoutesService,
  SchoolPeriodsHttpService
} from '@services/core';
import {
  IdButtonActionEnum,
  BreadcrumbEnum,
  CatalogueTypeEnum,
  ClassButtonActionEnum,
  IconButtonActionEnum,
  LabelButtonActionEnum,
  SeverityButtonActionEnum, RolesEnum
} from "@utils/enums";
import { EnrollmentDetailsHttpService } from '@services/core/enrollment-details-http.service';

@Component({
  selector: 'app-enrollment-detail-list',
  templateUrl: './enrollment-detail-list.component.html',
  styleUrls: ['./enrollment-detail-list.component.scss']
})
export class EnrollmentDetailListComponent implements OnInit {
  protected readonly PrimeIcons = PrimeIcons;
  protected readonly IconButtonActionEnum = IconButtonActionEnum;
  protected readonly LabelButtonActionEnum = LabelButtonActionEnum;
  protected readonly ClassButtonActionEnum = ClassButtonActionEnum;
  protected readonly BreadcrumbEnum = BreadcrumbEnum;
  protected buttonActions: MenuItem[] = this.buildButtonActions;
  protected columns: ColumnModel[] = this.buildColumns;
  protected isButtonActions: boolean = false;
  protected search: FormControl = new FormControl('');

  protected enrollmentId!: string;
  protected selectedItem: SelectEnrollmentDetailDto = {};
  protected selectedItems: EnrollmentDetailModel[] = [];
  protected items: EnrollmentDetailModel[] = [];

  protected schoolPeriods: SchoolPeriodModel[] = [];
  protected careers: CareerModel[] = [];
  protected academicPeriods: CatalogueModel[] = [];
  protected selectedEnrollment: FormControl = new FormControl();
  protected selectedSchoolPeriod: FormControl = new FormControl();
  protected selectedAcademicPeriod: FormControl = new FormControl();

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private breadcrumbService: BreadcrumbService,
    public coreService: CoreService,
    public messageService: MessageService,
    private readonly router: Router,
    private routesService: RoutesService,
    private enrollmentsHttpService: EnrollmentsHttpService,
    private cataloguesHttpService: CataloguesHttpService,
    private schoolPeriodsHttpService: SchoolPeriodsHttpService,
    private careersService: CareersService,
    private careersHttpService: CareersHttpService,
    private enrollmentDetailsHttpService: EnrollmentDetailsHttpService,

  ) {
    this.breadcrumbService.setItems([
      { label: BreadcrumbEnum.ENROLLMENTS, routerLink: [this.routesService.enrollments(RolesEnum.SECRETARY)] },
      {label: BreadcrumbEnum.ENROLLMENT_DETAILS }
    ]);

    this.enrollmentId = activatedRoute.snapshot.params['enrollmentId'];

    this.search.valueChanges.subscribe(value => {
      if (value.length === 0) {
        this.findEnrollmentDetailsByEnrollment();
      }
    });
  }

  ngOnInit() {
    this.findEnrollmentDetailsByEnrollment();
    this.findSchoolPeriods();
    this.findAcademicPeriods();
    this.findCareers();
  }

  findSchoolPeriods() {
    this.schoolPeriodsHttpService.findAll().subscribe(
      schoolPeriods => {
        this.schoolPeriods = schoolPeriods;
      }
    )
  }

  findCareers(){
    this.careers = this.careersService.careers;
  }

  findAcademicPeriods(){
    this.academicPeriods = this.cataloguesHttpService.findByType(CatalogueTypeEnum.ACADEMIC_PERIOD);
  }

  /** Load Data **/
  findEnrollmentDetailsByEnrollment(page: number = 0) {
    this.enrollmentsHttpService.findEnrollmentDetailsByEnrollment(this.enrollmentId)
      .subscribe((response) => {
        this.items = response;
      });
  }

  /** Build Data **/
  get buildColumns(): ColumnModel[] {
    return [
      {field: 'academicPeriod', header: 'Periodo Académico'},
      {field: 'subject', header: 'Asignaturas'},
      {field: 'number', header: 'Número de Matrícula'},
      {field: 'workday', header: 'Horario'},
      {field: 'parallel', header: 'Paralelo'},
      {field: 'type', header: 'Tipo de Matrícula'},
      {field: 'enrollmentDetailState', header: 'Estado'},
      {field: 'finalGrade', header: 'Calificación'},
      {field: 'finalAttendance', header: 'Asistencia'},
      {field: 'academicState', header: 'Estado Académico'}

    ];
  }

  get buildButtonActions() {
    return [
      {
        id: IdButtonActionEnum.UPDATE,
        label: 'Editar',
        icon: PrimeIcons.PENCIL,
        command: () => {
          if (this.selectedItem?.id) this.redirectEditForm(this.selectedItem.id);
        },
      },
      {
        label: 'Matricular',
        icon: PrimeIcons.BOOK,
        command: () => {
          if (this.selectedItem?.id) this.enroll(this.selectedItem.id);
        },
      },
      {
        label: 'Anular',
        icon: PrimeIcons.BAN,
        command: () => {
          if (this.selectedItem?.id) this.revoke(this.selectedItem.id);
        },
      },
      {
        id: IdButtonActionEnum.APPROVED,
        label: 'Aprobar',
        icon: PrimeIcons.CHECK,
        command: () => {
          if (this.selectedItem?.id) this.approve(this.selectedItem.id);
        },
      },
      {
        id: IdButtonActionEnum.REJECTED,
        label: 'Rechazar',
        icon: PrimeIcons.BAN,
        command: () => {
          if (this.selectedItem?.id) this.reject(this.selectedItem.id);
        },
      },
      {
        label: 'Eliminar',
        icon: PrimeIcons.TRASH,
        command: () => {
          if (this.selectedItem?.id) this.remove(this.selectedItem.id);
        },
      },
    ];
  }

  /** Actions **/
  remove(id: string) {
    this.messageService.questionDelete()
      .then((result) => {
        if (result.isConfirmed) {
          this.enrollmentDetailsHttpService.remove(id).subscribe(() => {
            this.items = this.items.filter(item => item.id !== id);
          });
        }
      });
  }

  enroll(id: string) {
    this.enrollmentDetailsHttpService.enroll(id).subscribe(item => {
      this.findEnrollmentDetailsByEnrollment();
    });
  }

  revoke(id: string) {
    this.enrollmentDetailsHttpService.revoke(id).subscribe(item => {
      this.findEnrollmentDetailsByEnrollment();
    });
  }

  approve(id: string) {
    this.enrollmentDetailsHttpService.approve(id).subscribe(item => {
      this.findEnrollmentDetailsByEnrollment();
    });
  }

  reject(id: string) {
    this.enrollmentDetailsHttpService.reject(id).subscribe(item => {
      this.findEnrollmentDetailsByEnrollment();
    });
  }

  /** Select & Paginate **/
  selectItem(item: EnrollmentDetailModel) {
    this.isButtonActions = true;
    this.selectedItem = item;
  }

  /** Redirects **/
  redirectCreateForm() {
    this.router.navigate([this.routesService.enrollmentsDetailForm(this.enrollmentId), 'new']);
  }

  redirectEditForm(id: string) {
    this.router.navigate([this.routesService.enrollmentsDetailForm(this.enrollmentId), id]);
  }

    protected readonly SeverityButtonActionEnum = SeverityButtonActionEnum;
}
