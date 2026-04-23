import {Component, OnInit} from '@angular/core';
import {FormBuilder, AbstractControl, Validators, FormGroup} from '@angular/forms';
import {
  CareerModel,
  CatalogueModel,
  EnrollmentDetailModel,
  SelectEnrollmentDetailDto,
  SubjectModel
} from '@models/core';
import {OnExitInterface} from '@utils/interfaces';
import {PrimeIcons} from 'primeng/api';
import {ActivatedRoute, Router} from '@angular/router';
import {
  BreadcrumbService, CareersService,
  CataloguesHttpService,
  CoreService, CurriculumsHttpService,
  EnrollmentsHttpService,
  MessageService,
  RoutesService,
  SubjectsHttpService,
} from '@services/core';

import {
  BreadcrumbEnum,
  CatalogueTypeEnum,
  ClassButtonActionEnum,
  SkeletonEnum,
  LabelButtonActionEnum,
  IconButtonActionEnum, CatalogueEnrollmentStateEnum, RoutesEnum, SeverityButtonActionEnum, RolesEnum
} from '@utils/enums';

import {EnrollmentDetailsHttpService} from '@services/core';

@Component({
  selector: 'app-enrollment-detail-form',
  templateUrl: './enrollment-detail-form.component.html',
  styleUrls: ['./enrollment-detail-form.component.scss']
})
export class EnrollmentDetailFormComponent implements OnInit, OnExitInterface {
  protected readonly IconButtonActionEnum = IconButtonActionEnum;
  protected readonly ClassButtonActionEnum = ClassButtonActionEnum;
  protected readonly LabelButtonActionEnum = LabelButtonActionEnum;
  protected readonly SkeletonEnum = SkeletonEnum;
  protected readonly PrimeIcons = PrimeIcons;
  protected enrollmentId!: string;
  protected id: string = '';
  protected form: FormGroup;
  protected formErrors: string[] = [];

  protected selectedItem: SelectEnrollmentDetailDto = {};
  protected selectedItems: EnrollmentDetailModel[] = [];
  protected items: EnrollmentDetailModel[] = [];

  // Foreign Keys
  protected parallels: CatalogueModel[] = [];
  protected states: CatalogueModel[] = [];
  protected types: CatalogueModel[] = [];
  protected workdays: CatalogueModel[] = [];
  protected academicStates: CatalogueModel[] = [];
  protected subjects: SubjectModel[] = [];
  protected career!: CareerModel;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly breadcrumbService: BreadcrumbService,
    private readonly cataloguesHttpService: CataloguesHttpService,
    private readonly careersService: CareersService,
    protected readonly coreService: CoreService,
    protected readonly curriculumsHttpService: CurriculumsHttpService,
    private readonly formBuilder: FormBuilder,
    protected readonly messageService: MessageService,
    private readonly router: Router,
    private readonly routesService: RoutesService,
    private readonly enrollmentsHttpService: EnrollmentsHttpService,
    private readonly enrollmentDetailsHttpService: EnrollmentDetailsHttpService,
    private readonly subjectsHttpService: SubjectsHttpService,
  ) {
    this.enrollmentId = activatedRoute.snapshot.params['enrollmentId'];

    this.breadcrumbService.setItems([
      {label: BreadcrumbEnum.ENROLLMENTS, routerLink: [this.routesService.enrollments(RolesEnum.COORDINATOR_CAREER)]},
      {
        label: BreadcrumbEnum.ENROLLMENT_DETAILS,
        routerLink: [this.routesService.enrollmentsDetailList(this.enrollmentId, RolesEnum.COORDINATOR_CAREER)]
      },
      {label: BreadcrumbEnum.FORM},
    ]);

    this.form = this.newForm;

    if (activatedRoute.snapshot.params['id'] !== RoutesEnum.NEW) {
      this.id = activatedRoute.snapshot.params['id'];
      this.subjectField.disable();
      this.observationField.removeValidators(Validators.required);
    }

    this.career = this.careersService.career;
  }

  async onExit(): Promise<boolean> {
    if (this.form.touched && this.form.dirty) {
      return await this.messageService.questionOnExit().then(result => result.isConfirmed);
    }
    return true;
  }

  ngOnInit(): void {
    this.loadParallels();
    this.loadStates();
    this.loadWorkdays();
    this.loadTypes();
    this.loadAcademicStates();
    this.loadSubjects();

    if (this.id !== RoutesEnum.NEW) {
      this.get();
    }
  }

  get newForm(): FormGroup {
    return this.formBuilder.group({
      number: [null, [Validators.required, Validators.min(1), Validators.maxLength(3)]],
      date: [{value: null, disabled: true}],
      enrollmentId: this.enrollmentId,
      subject: [null],
      type: [null, [Validators.required]],
      workday: [null, [Validators.required]],
      parallel: [null, [Validators.required]],
      observation: [null, [Validators.required]],
      finalGrade: [null],
      finalAttendance: [null],
      academicState: [null],
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      if (this.id) {
        this.update(this.form.value);
      } else {
        this.create(this.form.value);
      }
    } else {
      this.form.markAllAsTouched();
      this.messageService.errorsFields(this.formErrors);
    }
  }

  back(): void {
    this.router.navigate([this.routesService.enrollmentsDetailList(this.enrollmentId, RolesEnum.COORDINATOR_CAREER)]);
  }

  /** Actions **/
  create(enrollmentDetail: EnrollmentDetailModel): void {
    this.enrollmentDetailsHttpService.create(enrollmentDetail).subscribe(enrollmentDetailResponse => {
      this.enrollmentDetailsHttpService.sendRequest(enrollmentDetailResponse.id!, enrollmentDetail).subscribe(() => {
        this.form.reset();
        this.back();
      });
    });
  }

  update(enrollmentDetail: EnrollmentDetailModel): void {
    this.enrollmentDetailsHttpService.update(this.id!, enrollmentDetail).subscribe(() => {
      this.form.reset();
      this.back();
    });
  }

  approve() {
    this.enrollmentsHttpService.approve(this.id!).subscribe(item => {
      this.back();
    });
  }

  reject() {
    this.enrollmentsHttpService.reject(this.id!).subscribe(item => {
      this.back();
    });
  }

  get(): void {
    this.enrollmentDetailsHttpService.findOne(this.id!).subscribe((enrollment) => {
      this.form.patchValue(enrollment);
      if (this.dateField.value)
        this.dateField.setValue(new Date(this.dateField.value));

      if (enrollment.enrollmentDetailState.state.code === CatalogueEnrollmentStateEnum.ENROLLED ||
        enrollment.enrollmentDetailState.state.code === CatalogueEnrollmentStateEnum.REVOKED) {
        this.form.disable();

        this.observationField.enable();
        this.parallelField.enable();
        this.workdayField.enable();
        this.finalGradeField.enable();
        this.finalAttendanceField.enable();
        this.academicStateField.enable();
      }
    });
  }

  /** Load Enrollment Details Data **/

  loadStates(): void {
    this.states = this.cataloguesHttpService.findByType(CatalogueTypeEnum.ENROLLMENTS_STATE);
  }

  loadParallels(): void {
    this.parallels = this.cataloguesHttpService.findByType(CatalogueTypeEnum.PARALLEL);
  }

  loadWorkdays(): void {
    this.workdays = this.cataloguesHttpService.findByType(CatalogueTypeEnum.ENROLLMENTS_WORKDAY);
  }

  loadTypes(): void {
    this.types = this.cataloguesHttpService.findByType(CatalogueTypeEnum.ENROLLMENTS_TYPE);
  }

  loadAcademicStates(): void {
    this.academicStates = this.cataloguesHttpService.findByType(CatalogueTypeEnum.ENROLLMENTS_ACADEMIC_STATE);
  }

  loadSubjects(): void {
    this.curriculumsHttpService.findSubjectsAllByCurriculum(this.career.curriculums[0].id)
      .subscribe((items) => this.subjects = items);
  }

  validateForm() {
    this.formErrors = [];
    if (this.dateField.errors) this.formErrors.push('Fecha');
    if (this.typeField.errors) this.formErrors.push('Tipo');
    if (this.workdayField.errors) this.formErrors.push(' Horario');
    if (this.parallelField.errors) this.formErrors.push('Paralelo');
    if (this.observationField.errors) this.formErrors.push('Observación');
    if (this.numberField.errors) this.formErrors.push('Número');

    this.formErrors.sort();
    return this.formErrors.length === 0 && this.form.valid;
  }


  /** Form Getters **/
  get subjectField(): AbstractControl {
    return this.form.controls['subject'];
  }

  get dateField(): AbstractControl {
    return this.form.controls['date'];
  }

  get numberField(): AbstractControl {
    return this.form.controls['number'];
  }

  get typeField(): AbstractControl {
    return this.form.controls['type'];
  }

  get workdayField(): AbstractControl {
    return this.form.controls['workday'];
  }

  get parallelField(): AbstractControl {
    return this.form.controls['parallel'];
  }

  get observationField(): AbstractControl {
    return this.form.controls['observation'];
  }

  get finalGradeField(): AbstractControl {
    return this.form.controls['finalGrade'];
  }

  get finalAttendanceField(): AbstractControl {
    return this.form.controls['finalAttendance'];
  }

  get academicStateField(): AbstractControl {
    return this.form.controls['academicState'];
  }

  protected readonly Validators = Validators;
  protected readonly SeverityButtonActionEnum = SeverityButtonActionEnum;
}
