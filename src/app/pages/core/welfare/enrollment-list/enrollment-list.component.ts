import {Component, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";
import {Router} from '@angular/router';
import {MenuItem, PrimeIcons} from "primeng/api";
import {
  ColumnModel,
  PaginatorModel,
  EnrollmentModel,
  CareerModel,
  CatalogueModel,
  SchoolPeriodModel
} from '@models/core';
import {
  BreadcrumbService,
  CareersHttpService,
  CareersService,
  CataloguesHttpService,
  CoreService,
  EnrollmentsHttpService,
  MessageService,
  RoutesService,
  SchoolPeriodsHttpService, SchoolPeriodsService, StudentsHttpService
} from '@services/core';
import {
  IdButtonActionEnum,
  BreadcrumbEnum,
  CatalogueTypeEnum,
  ClassButtonActionEnum,
  IconButtonActionEnum,
  LabelButtonActionEnum,
  CatalogueEnrollmentStateEnum, RolesEnum
} from "@utils/enums";
import {debounceTime} from "rxjs";

@Component({
  selector: 'app-enrollment-list',
  templateUrl: './enrollment-list.component.html',
  styleUrls: ['./enrollment-list.component.scss'],
})
export class EnrollmentListComponent implements OnInit {
  protected readonly PrimeIcons = PrimeIcons;
  protected readonly IconButtonActionEnum = IconButtonActionEnum;
  protected readonly LabelButtonActionEnum = LabelButtonActionEnum;
  protected readonly ClassButtonActionEnum = ClassButtonActionEnum;
  protected readonly BreadcrumbEnum = BreadcrumbEnum;
  protected buttonActions: MenuItem[] = this.buildButtonActions;
  protected moreButtonActions: MenuItem[] = this.buildMoreButtonActions;
  protected isMoreButtonActions: boolean = false;
  protected columns: ColumnModel[] = this.buildColumns;
  protected isButtonActions: boolean = false;
  protected paginator: PaginatorModel;
  protected search: FormControl = new FormControl('');
  protected selectedItem!: EnrollmentModel;
  protected selectedItems: EnrollmentModel[] = [];
  protected items: EnrollmentModel[] = [];
  protected schoolPeriods: SchoolPeriodModel[] = [];
  protected careers: CareerModel[] = [];
  protected academicPeriods: CatalogueModel[] = [];
  protected enrollmentStates: CatalogueModel[] = [];
  protected selectedCareer: FormControl = new FormControl();
  protected selectedSchoolPeriod: FormControl = new FormControl();
  protected selectedAcademicPeriod: FormControl = new FormControl();
  protected selectedEnrollmentState: FormControl = new FormControl();
  protected state: CatalogueModel[] = [];
  protected isVisible: boolean = false;
  protected isLoadingPdf: boolean = false;

  constructor(
    private breadcrumbService: BreadcrumbService,
    public coreService: CoreService,
    public messageService: MessageService,
    private router: Router,
    private routesService: RoutesService,
    private enrollmentsHttpService: EnrollmentsHttpService,
    private cataloguesHttpService: CataloguesHttpService,
    private schoolPeriodsHttpService: SchoolPeriodsHttpService,
    private careersService: CareersService,
    private careersHttpService: CareersHttpService,
    private schoolPeriodsService: SchoolPeriodsService,
    private studentsHttpService: StudentsHttpService,
  ) {
    this.breadcrumbService.setItems([{label: BreadcrumbEnum.ENROLLMENTS}]);

    this.paginator = this.coreService.paginator;

    this.search.valueChanges.pipe(debounceTime(1000))
      .subscribe(value => {
        this.findEnrollmentsByCareer();
      });

    this.selectedSchoolPeriod.valueChanges.subscribe(value => {
      this.findEnrollmentsByCareer();
    });

    this.selectedCareer.valueChanges.subscribe(value => {
      this.findEnrollmentsByCareer();
    });

    this.selectedAcademicPeriod.valueChanges.subscribe(value => {
      this.findEnrollmentsByCareer();
    });

    this.selectedSchoolPeriod.patchValue(this.schoolPeriodsService.openSchoolPeriod);

    this.selectedEnrollmentState.valueChanges.subscribe(value => {
      this.findEnrollmentsByCareer();
    });

    this.selectedCareer.patchValue(this.careersService.career);
  }

  ngOnInit() {
    this.findEnrollmentsByCareer();
    this.findSchoolPeriods();
    this.findAcademicPeriods();
    this.findEnrollmentStates();
    this.findCareers();
  }

  findSchoolPeriods() {
    this.schoolPeriodsHttpService.findAll().subscribe(
      schoolPeriods => {
        this.schoolPeriods = schoolPeriods;
      }
    )
  }

  findCareers() {
    this.careers = this.careersService.careers;
  }

  findAcademicPeriods() {
    this.academicPeriods = this.cataloguesHttpService.findByType(CatalogueTypeEnum.ACADEMIC_PERIOD);
  }

  findEnrollmentStates() {
    this.enrollmentStates = this.cataloguesHttpService.findByType(CatalogueTypeEnum.ENROLLMENTS_STATE);
    this.enrollmentStates = this.enrollmentStates.sort(
      function (a, b) {
        if (a.name > b.name) {
          return 1;
        }
        if (a.name < b.name) {
          return -1;
        }
        return 0;
      });
  }

  /** Load Data **/
  findEnrollmentsByCareer(page: number = 0) {
    if (this.selectedCareer.value && this.selectedSchoolPeriod.value) {
      this.careersHttpService.findEnrollmentsByCareer(
        this.selectedCareer.value.id,
        this.selectedSchoolPeriod.value.id,
        this.selectedAcademicPeriod.value?.id,
        this.selectedEnrollmentState.value?.id,
        page,
        this.search.value)
        .subscribe((response) => {
          this.paginator = response.pagination!;
          this.items = response.data
        });
    }
  }

  /** Build Data **/
  get buildColumns(): ColumnModel[] {
    return [
      {field: 'identification', header: 'Número de Documento'},
      {field: 'lastname', header: 'Apellidos'},
      {field: 'name', header: 'Nombres'},
      {field: 'type', header: 'Tipo de Matrícula'},
      {field: 'academicPeriod', header: 'Periodo académico'},
      {field: 'workday', header: 'Horario'},
      {field: 'parallel', header: 'Paralelo'},
      {field: 'enrollmentState', header: 'Estado'}
    ];
  }

  get buildButtonActions() {
    return [
      {
        id: IdButtonActionEnum.ENROLLED,
        label: 'Descargar Ficha Socioeconómica',
        icon: PrimeIcons.DOWNLOAD,
        command: () => {
          if (this.selectedItem?.id) this.downloadSocioeconomicForm(this.selectedItem);
        },
      },
      {
        id: IdButtonActionEnum.DOWNLOADS,
        label: 'Descargar Certificado',
        icon: PrimeIcons.DOWNLOAD,
        command: () => {
          if (this.selectedItem?.id) this.downloadEnrollmentCertificate(this.selectedItem);
        },
      },
    ];
  }

  validateButtonActions(item: EnrollmentModel) {

  }

  get buildMoreButtonActions() {
    return [
      {
        id: IdButtonActionEnum.DOWNLOADS,
        label: 'Descargar Matriculados por Carrera',
        icon: IconButtonActionEnum.DOWNLOADS,
        command: () => {
          this.downloadEnrollmentsByCareer(this.selectedCareer.value);
        },
      },
      {
        id: IdButtonActionEnum.DOWNLOADS,
        label: 'Descargar Matriculados por Periodo Lectivo',
        icon: IconButtonActionEnum.DOWNLOADS,
        command: () => {
          this.downloadEnrollmentsBySchoolPeriod();
        },
      },
      {
        id: IdButtonActionEnum.DOWNLOADS,
        label: 'Descargar Fichas Socioeconómicas por Periodo Lectivo',
        icon: IconButtonActionEnum.DOWNLOADS,
        command: () => {
          this.downloadSocioeconomicFormsBySchoolPeriod();
        },
      },
    ];
  }

  /** Actions **/
  remove(id: string) {
    this.messageService.questionDelete()
      .then((result) => {
        if (result.isConfirmed) {
          this.enrollmentsHttpService.remove(id).subscribe(() => {
            this.items = this.items.filter(item => item.id !== id);
            this.paginator.totalItems--;
          });
        }
      });
  }

  removeAll() {
    this.messageService.questionDelete().then((result) => {
      if (result.isConfirmed) {
        this.enrollmentsHttpService.removeAll(this.selectedItems).subscribe(() => {
          this.selectedItems.forEach(itemDeleted => {
            this.items = this.items.filter(item => item.id !== itemDeleted.id);
            this.paginator.totalItems--;
          });
          this.selectedItems = [];
        });
      }
    });
  }

  enroll(id: string) {
    this.enrollmentsHttpService.enroll(id).subscribe(item => {
      this.findEnrollmentsByCareer();
    });
  }

  revoke(id: string) {
    this.enrollmentsHttpService.revoke(id).subscribe(item => {
      this.findEnrollmentsByCareer();
    });
  }

  approve(id: string) {
    this.enrollmentsHttpService.approve(id).subscribe(item => {
      this.findEnrollmentsByCareer();
    });
  }

  reject(id: string) {
    this.enrollmentsHttpService.reject(id).subscribe(item => {
      this.findEnrollmentsByCareer();
    });
  }

  downloadModal() {
    this.isVisible = true;
  }

  showMoreOptions() {
    this.isMoreButtonActions = true;
  }

  downloadSocioeconomicForm(enrollment: EnrollmentModel) {
    this.studentsHttpService.downloadSocioeconomicForm(enrollment.student.id);
  }

  downloadEnrollmentCertificate(enrollment: EnrollmentModel) {
    if (enrollment.enrollmentState.state.code === CatalogueEnrollmentStateEnum.ENROLLED) {
      this.enrollmentsHttpService.downloadEnrollmentCertificate(enrollment.id, this.selectedItem.student.user.identification);
    } else {
      this.messageService.errorCustom('No se puede descargar', 'El estudiante no se encuentra matriculado');
    }

  }

  downloadEnrollmentsByCareer(career: CareerModel) {
    this.enrollmentsHttpService.downloadEnrollmentsByCareer(career, this.selectedSchoolPeriod.value?.id);
  }

  downloadEnrollmentsBySchoolPeriod() {
    this.enrollmentsHttpService.downloadEnrollmentsBySchoolPeriod(this.selectedSchoolPeriod.value);
  }

  downloadSocioeconomicFormsBySchoolPeriod() {
    this.studentsHttpService.downloadSocioeconomicFormsBySchoolPeriod(this.selectedSchoolPeriod.value);
  }

  /** Select & Paginate **/
  selectItem(item: EnrollmentModel) {
    this.isButtonActions = true;
    this.selectedItem = item;
    this.validateButtonActions(item);
  }

  paginate(event: any) {
    this.findEnrollmentsByCareer(event.page);
  }

  /** Redirects **/
  redirectCreateForm() {
    this.router.navigate([this.routesService.enrollments(RolesEnum.WELFARE), 'new']);
  }

  redirectEditForm(id: string) {
    this.router.navigate([this.routesService.enrollments(RolesEnum.WELFARE), id]);
  }

  redirectEnrollmentDetails(id: string) {
    this.router.navigate([this.routesService.enrollmentsDetailList(this.selectedItem.id!, RolesEnum.WELFARE)]);
  }
}
