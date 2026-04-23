import {Component, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";
import {ActivatedRoute, Router} from '@angular/router';
import {MenuItem, PrimeIcons} from "primeng/api";
import {
  ColumnModel,
  CareerModel,
  CatalogueModel,
  SchoolPeriodModel,
  SelectEnrollmentDetailDto,
  EnrollmentDetailModel,
} from '@models/core';
import {
  BreadcrumbService,
  CareersHttpService,
  CareersService,
  CataloguesHttpService,
  CoreService,
  EnrollmentsHttpService,
  EnrollmentDetailsHttpService,
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
    CatalogueEnrollmentStateEnum, SeverityButtonActionEnum
} from "@utils/enums";

@Component({
  selector: 'app-inscription-detail-list',
  templateUrl: './inscription-detail-list.component.html',
  styleUrls: ['./inscription-detail-list.component.scss']
})
export class InscriptionDetailListComponent implements OnInit {
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
  protected enrolledOrRevoked: boolean = false;

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
      {label: BreadcrumbEnum.INSCRIPTIONS, routerLink: [this.routesService.inscriptions]},
      {label: BreadcrumbEnum.INSCRIPTION_DETAILS}
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
    this.findEnrollment();
  }

  back(): void {
    this.router.navigate([this.routesService.inscriptions]);
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

  /** Load Data **/
  findEnrollmentDetailsByEnrollment(page: number = 0) {
    this.enrollmentsHttpService.findEnrollmentDetailsByEnrollment(this.enrollmentId)
      .subscribe((response) => {
        this.items = response;
      });
  }

  findEnrollment(): void {
    this.enrollmentsHttpService.findOne(this.enrollmentId).subscribe((enrollment) => {
      if (enrollment.enrollmentState) {
        const exist = enrollment.enrollmentState.state.code === CatalogueEnrollmentStateEnum.ENROLLED ||
          enrollment.enrollmentState.state.code === CatalogueEnrollmentStateEnum.REVOKED

        this.enrolledOrRevoked = exist;
      }
    });
  }

  /** Build Data **/
  get buildColumns(): ColumnModel[] {
    return [
      {field: 'subject', header: 'Asignaturas'},
      {field: 'number', header: 'Número de Matrícula'},
      {field: 'workday', header: 'Horario'},
      {field: 'parallel', header: 'Paralelo'},
      {field: 'type', header: 'Tipo de Matrícula'},
      {field: 'enrollmentDetailState', header: 'Estado'},
      {field: 'observation', header: 'Observaciones'}
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
        id: IdButtonActionEnum.DELETE,
        label: 'Eliminar',
        icon: PrimeIcons.TRASH,
        command: () => {
          if (this.selectedItem?.id) this.remove(this.selectedItem.id);
        },
      },
    ];
  }

  validateButtonActions(item: EnrollmentDetailModel) {
    this.buttonActions = this.buildButtonActions;
    let index = -1;

    if (this.enrolledOrRevoked) {
      this.buttonActions = [];
    }

    if (item.enrollmentDetailState.state.code !== CatalogueEnrollmentStateEnum.REQUEST_SENT) {
      index = this.buttonActions.findIndex(actionButton => actionButton.id === IdButtonActionEnum.APPROVED);
      if (index > -1)
        this.buttonActions.splice(index, 1);

      index = this.buttonActions.findIndex(actionButton => actionButton.id === IdButtonActionEnum.REJECTED)
      if (index > -1)
        this.buttonActions.splice(index, 1);
    }

    if (item.enrollmentDetailState.state.code === CatalogueEnrollmentStateEnum.APPROVED) {
      index = this.buttonActions.findIndex(actionButton => actionButton.id === IdButtonActionEnum.APPROVED);
      if (index > -1)
        this.buttonActions.splice(index, 1);
    }

    if (item.enrollmentDetailState.state.code === CatalogueEnrollmentStateEnum.REJECTED) {
      index = this.buttonActions.findIndex(actionButton => actionButton.id === IdButtonActionEnum.REJECTED);
      if (index > -1)
        this.buttonActions.splice(index, 1);
    }
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
      const index = this.items.findIndex(item => item.id === id);
    });
  }

  revoke(id: string) {
    this.enrollmentDetailsHttpService.revoke(id).subscribe(item => {
      const index = this.items.findIndex(item => item.id === id);
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
    this.validateButtonActions(item);
  }

  /** Redirects **/
  redirectCreateForm() {
    this.router.navigate([this.routesService.inscriptionsDetailForm(this.enrollmentId), 'new']);
  }

  redirectEditForm(id: string) {
    this.router.navigate([this.routesService.inscriptionsDetailForm(this.enrollmentId), id]);
  }

    protected readonly SeverityButtonActionEnum = SeverityButtonActionEnum;
}
