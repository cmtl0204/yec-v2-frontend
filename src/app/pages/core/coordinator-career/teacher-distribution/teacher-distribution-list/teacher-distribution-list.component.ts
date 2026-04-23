import {Component, inject, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Router} from '@angular/router';
import {MenuItem, PrimeIcons, SelectItem} from 'primeng/api';
import {
  ColumnModel,
  PaginatorModel,
  TeacherDistributionModel,
  SelectTeacherDistributionDto,
  CareerModel,
} from '@models/core';
import {
  BreadcrumbService,
  CoreService, EventsService,
  MessageService,
  RoutesService,
  CareersHttpService, TeacherDistributionsHttpService, TeacherDistributionsService, SchoolPeriodsService
} from '@services/core';
import {IdButtonActionEnum, BreadcrumbEnum} from "@utils/enums";

@Component({
  selector: 'app-teacher-distribution-list',
  templateUrl: './teacher-distribution-list.component.html',
  styleUrls: ['./teacher-distribution-list.component.scss']
})
export class TeacherDistributionListComponent implements OnInit {
  /**Inject Dependencies **/
  private readonly breadcrumbService = inject(BreadcrumbService);
  private readonly careersHttpService = inject(CareersHttpService);
  protected readonly coreService = inject(CoreService);
  protected readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly routesService = inject(RoutesService);
  protected readonly schoolPeriodsService = inject(SchoolPeriodsService);
  private readonly teacherDistributionsService = inject(TeacherDistributionsService);
  private readonly teacherDistributionsHttpService = inject(TeacherDistributionsHttpService);

  protected readonly PrimeIcons = PrimeIcons;
  protected buttonActions: MenuItem[] = [];
  protected columns: ColumnModel[] = this.buildColumns;
  protected isButtonActions: boolean = false;
  protected paginator: PaginatorModel;
  protected search: FormControl = new FormControl('');
  protected selectedItem: SelectTeacherDistributionDto = {};
  protected selectedItems: TeacherDistributionModel[] = [];
  protected items: TeacherDistributionModel[] = [];
  protected careerOptions: SelectItem[] = [];
  protected selectedCareer: any;
  protected isCareerSelected: boolean = false;

  constructor() {
    this.breadcrumbService.setItems([
      {label: BreadcrumbEnum.TEACHER_DISTRIBUTIONS},
    ]);

    this.paginator = this.coreService.paginator;

    this.search.valueChanges.subscribe(value => {
      if (value.length === 0) {
        this.findAll();
      }
    });
  }

  ngOnInit() {
    this.findAll();
    this.loadCareerOptions();
  }

  /** Load Data **/
  findAll(page: number = 0) {
    this.teacherDistributionsHttpService.findAll(page, this.search.value)
      .subscribe((response) => {
        this.paginator = response.pagination!;
        this.items = response.data;
      });
  }

  loadCareerOptions() {
    this.careersHttpService.getAllCareerNames().subscribe({
      next: (careers: CareerModel[]) => {
        this.careerOptions = careers.map(career => ({label: career.name, value: career.name}));
      },
      error: (error) => {
        console.error("Error loading career options:", error);
      }
    });
  }

  /** Build Data **/
  get buildColumns(): ColumnModel[] {
    return [
      {field: 'parallel', header: 'Paralelo'},
      {field: 'teacher', header: 'Docente'},
      {field: 'schoolPeriod', header: 'Periodo Lectivo'},
      {field: 'subject', header: 'Asignatura'},
      {field: 'workday', header: 'Horario'}
    ];
  }

  buildButtonActions(): void {
    this.buttonActions = [];

    this.buttonActions.push(
      {
        id: IdButtonActionEnum.UPDATE,
        label: 'Actualizar',
        icon: PrimeIcons.PENCIL,
        command: () => {
          if (this.selectedItem?.id) this.redirectEditForm(this.selectedItem.id);
        },
      });

    this.buttonActions.push(
      {
        id: IdButtonActionEnum.DELETE,
        label: 'Eliminar',
        icon: PrimeIcons.TRASH,
        command: () => {
          if (this.selectedItem?.id) this.remove(this.selectedItem.id);
        },
      });
  }

  /** Actions **/
  remove(id: string) {
    this.messageService.questionDelete()
      .then((result) => {
        if (result.isConfirmed) {
          this.teacherDistributionsHttpService.remove(id).subscribe(() => {
            this.items = this.items.filter(item => item.id !== id);
            this.paginator.totalItems--;
          });
        }
      });
  }

  removeAll() {
    this.messageService.questionDelete().then((result) => {
      if (result.isConfirmed) {
        this.teacherDistributionsHttpService.removeAll(this.selectedItems).subscribe(() => {
          this.selectedItems.forEach(itemDeleted => {
            this.items = this.items.filter(item => item.id !== itemDeleted.id);
            this.paginator.totalItems--;
          });
          this.selectedItems = [];
        });
      }
    });
  }

  /** Select & Paginate **/
  selectItem(item: TeacherDistributionModel) {
    this.isButtonActions = true;
    this.selectedItem = item;
    this.teacherDistributionsService.teacherDistribution = item;
    this.buildButtonActions();
  }

  paginate(event: any) {
    this.findAll(event.page);
  }

  /** Redirects **/
  redirectCreateForm() {
    this.router.navigate([this.routesService.teacherDistributions, 'new']);
  }

  redirectEditForm(id: string) {
    this.router.navigate([this.routesService.teacherDistributions, id]);
  }

  onCareerSelected() {
    this.isCareerSelected = true;
  }

  export() {
    this.teacherDistributionsHttpService.downloadFile('excel');
  }
}
