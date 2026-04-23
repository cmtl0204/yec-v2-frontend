import {Component, OnInit} from '@angular/core';
import {FormControl} from "@angular/forms";
import {MenuItem, PrimeIcons} from "primeng/api";
import {
  ColumnModel,
  EnrollmentDetailModel, EnrollmentModel,
  SchoolPeriodModel,
  TeacherDistributionModel
} from "@models/core";
import {AuthService} from "@services/auth";
import {Router} from "@angular/router";
import {
  BreadcrumbService, CoreService, GradesHttpService, MessageService,
  RoutesService,
  SchoolPeriodsService,
  TeacherDistributionsHttpService,
  TeacherDistributionsService, TeachersHttpService
} from "@services/core";
import {
  BreadcrumbEnum,
  IconButtonActionEnum,
  IdButtonActionEnum, LabelButtonActionEnum, SeverityButtonActionEnum,
  SkeletonEnum, UsersFormEnum
} from "@utils/enums";

@Component({
  selector: 'app-grade-list',
  templateUrl: './grade-list.component.html',
  styleUrls: ['./grade-list.component.scss']
})
export class GradeListComponent implements OnInit {
  protected readonly PrimeIcons = PrimeIcons;
  protected readonly SkeletonEnum = SkeletonEnum;
  protected readonly IconButtonActionEnum = IconButtonActionEnum;
  protected readonly SeverityButtonActionEnum = SeverityButtonActionEnum;
  protected readonly LabelButtonActionEnum = LabelButtonActionEnum;
  protected readonly BreadcrumbEnum = BreadcrumbEnum;

  protected selectedSchoolPeriod: FormControl = new FormControl();
  protected schoolPeriods: SchoolPeriodModel[] = [];
  protected selectedItem!: EnrollmentDetailModel;
  protected selectedItems: EnrollmentDetailModel[] = [];
  protected items: EnrollmentDetailModel[] = [];
  protected buttonActions: MenuItem[] = this.buildButtonActions;
  protected columns: ColumnModel[] = this.buildColumns;
  protected isButtonActions: boolean = false;
  protected isModalGrades: boolean = false;
  protected isModalSupplementaryGrade: boolean = false;
  protected uploadErrors: boolean = false;

  constructor(
    protected readonly authService: AuthService,
    private readonly router: Router,
    private readonly routesService: RoutesService,
    private readonly schoolPeriodsService: SchoolPeriodsService,
    private readonly gradesHttpService: GradesHttpService,
    private readonly teacherDistributionsHttpService: TeacherDistributionsHttpService,
    protected readonly teacherDistributionsService: TeacherDistributionsService,
    private readonly teachersHttpService: TeachersHttpService,
    private readonly breadcrumbService: BreadcrumbService,
    protected readonly coreService: CoreService,
    protected readonly messageService: MessageService,
  ) {
    this.breadcrumbService.setItems([
      {label: BreadcrumbEnum.TEACHER_DISTRIBUTIONS, routerLink: [this.routesService.teacherDistributions]},
      {label: BreadcrumbEnum.TEACHER_DISTRIBUTIONS_GRADES},
    ]);

    this.schoolPeriods = [this.schoolPeriodsService.openSchoolPeriod];

    this.selectedSchoolPeriod.patchValue(this.schoolPeriodsService.openSchoolPeriod);
  }

  ngOnInit(): void {
    this.findEnrollmentsByTeacherDistribution();
  }

  findEnrollmentsByTeacherDistribution() {
    this.teacherDistributionsHttpService.findEnrollmentDetailsByTeacherDistribution(this.teacherDistributionsService.teacherDistribution.id!)
      .subscribe(enrollmentDetails => {
        this.items = enrollmentDetails;
      });
  }

  redirectTeacherDistributionGrades(item: TeacherDistributionModel) {
    this.teacherDistributionsService.teacherDistribution = item;
    this.router.navigate([this.routesService.teacherDistributionsGrades]);
  }

  get buildColumns(): ColumnModel[] {
    return [
      {field: 'identification', header: UsersFormEnum.identification},
      {field: 'lastname', header: UsersFormEnum.lastname},
      {field: 'name', header: UsersFormEnum.name},
      {field: 'enrollmentDetailNumber', header: 'N° de matrícula'},
      {field: 'grade1', header: 'Parcial 1'},
      {field: 'grade2', header: 'Parcial 2'},
      // {field: 'grade3', header: 'Evaluación Final'},
      // {field: 'supplementaryGrade', header: 'Evaluación de Recuperación'},
      {field: 'finalGrade', header: 'Calificación final'},
      {field: 'finalAttendance', header: 'Asistencia'},
      {field: 'academicState', header: 'Estado'},
    ];
  }

  get buildButtonActions() {
    return [
      {
        id: IdButtonActionEnum.UPDATE,
        label: LabelButtonActionEnum.UPDATE,
        icon: IconButtonActionEnum.UPDATE,
        command: () => {
          if (this.selectedItem?.id) this.openModalGrades(this.selectedItem);
        },
      },
    ];
  }

  validateButtonActions(item: EnrollmentDetailModel): void {
    this.buttonActions = this.buildButtonActions;

    const finalGrade = parseFloat(String(item.finalGrade));

    if (item.supplementaryGrade || (finalGrade && finalGrade >= 4 && finalGrade < 7)) {
      this.buttonActions.push({
        id: IdButtonActionEnum.SAVE_SUPPLEMENTARY_GRADE,
        label: LabelButtonActionEnum.SAVE_SUPPLEMENTARY_GRADE,
        icon: IconButtonActionEnum.SAVE_SUPPLEMENTARY_GRADE,
        command: () => {
          if (this.selectedItem?.id) this.openModalSupplementaryGrade(this.selectedItem);
        },
      });
    }
  }

  selectItem(item: EnrollmentDetailModel) {
    this.isButtonActions = true;
    this.selectedItem = item;
    this.validateButtonActions(item);
  }

  openModalGrades(enrollmentDetail: EnrollmentDetailModel) {
    this.isModalGrades = true;
  }

  openModalSupplementaryGrade(enrollmentDetail: EnrollmentDetailModel) {
    this.isModalSupplementaryGrade = true;
  }

  uploadGrades(event: any, uploadFiles: any) {
    const formData = new FormData();
    formData.append('file', event.files[0]);
    formData.append('teacherDistributionId', this.teacherDistributionsService.teacherDistribution.id!);
    formData.append('careerId', this.teacherDistributionsService.teacherDistribution.subject.curriculum.careerId!);

    this.gradesHttpService.uploadGrades(formData).subscribe({
      next: (response) => {
        this.uploadErrors = false;
        this.findEnrollmentsByTeacherDistribution();
      },
      error: () => {
        this.findEnrollmentsByTeacherDistribution();
        this.uploadErrors = true;
        uploadFiles.clear();
      },
      complete: () => {
        uploadFiles.clear()
      }
    });
  }

  downloadGradesByTeacherDistribution() {
    this.gradesHttpService.downloadGradesByTeacherDistribution(this.teacherDistributionsService.teacherDistribution);
  }

  downloadErrorReport() {
    this.gradesHttpService.downloadErrorReport(this.teacherDistributionsService.teacherDistribution.id!);
  }

  downloadGradesReport() {
    this.gradesHttpService.downloadGradesReport(this.teacherDistributionsService.teacherDistribution.id!);
  }
}
